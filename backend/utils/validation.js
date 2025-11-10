const validateNestedFields = (nestedFields, answers, parentFieldName, errors) => {
  for (const nestedField of nestedFields) {
    const nestedFieldName = `${parentFieldName}.${nestedField.name}`;
    const nestedValue = answers[nestedFieldName];
    
    // Skip validation for non-required empty fields
    if (!nestedField.required && (nestedValue === undefined || nestedValue === null || nestedValue === '')) {
      continue;
    }
    
    if (nestedField.required && (nestedValue === undefined || nestedValue === null || nestedValue === '')) {
      errors[nestedFieldName] = `${nestedField.label} is required`;
      continue;
    }
    
    // Apply validation only if field has value
    validateFieldValue(nestedField, nestedValue, nestedFieldName, errors);
  }
};

const validateFieldValue = (field, value, fieldName, errors) => {
  switch (field.type) {
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[fieldName] = 'Invalid email format';
      }
      break;
      
    case 'number':
      const num = Number(value);
      if (isNaN(num)) {
        errors[fieldName] = 'Must be a valid number';
      } else {
        if (field.validation?.min !== undefined && num < field.validation.min) {
          errors[fieldName] = `Must be at least ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && num > field.validation.max) {
          errors[fieldName] = `Must be at most ${field.validation.max}`;
        }
      }
      break;
      
    case 'date':
      if (isNaN(Date.parse(value))) {
        errors[fieldName] = 'Invalid date format';
      }
      break;
      
    case 'checkbox':
      if (!Array.isArray(value) && typeof value !== 'boolean') {
        errors[fieldName] = 'Invalid checkbox value';
      }
      break;
      
    case 'radio':
    case 'select':
      if (field.options && !field.options.some(opt => opt.value === value)) {
        errors[fieldName] = 'Invalid option selected';
      }
      break;
  }
  
  if (field.validation?.pattern && typeof value === 'string') {
    try {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        errors[fieldName] = field.validation.message || 'Invalid format';
      }
    } catch (e) {
      errors[fieldName] = 'Invalid pattern configuration';
    }
  }
};

const validateSubmission = (form, answers) => {
  const errors = {};
  
  for (const field of form.fields) {
    const value = answers[field.name];
    
    // Skip validation for non-required empty fields
    if (!field.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Required field validation
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = `${field.label} is required`;
      continue;
    }
    
    // Type-specific validation only if field has value
    validateFieldValue(field, value, field.name, errors);
    
    // Validate nested fields if option is selected
    if (value && field.options) {
      const selectedOption = field.options.find(opt => opt.value === value);
      if (selectedOption?.nestedFields) {
        validateNestedFields(selectedOption.nestedFields, answers, field.name, errors);
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = { validateSubmission };