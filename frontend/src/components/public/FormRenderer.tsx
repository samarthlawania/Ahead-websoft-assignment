import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import { Form, FormField } from "@/types/form";
import { toast } from "sonner";

export const FormRenderer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  const loadForm = async (formId: string) => {
    try {
      setLoading(true);
      const foundForm = await api.public.getForm(formId);
      setForm(foundForm);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load form: ${error.message}`);
      } else {
        toast.error("Failed to load form");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      if (field.type === "number") {
        const numValue = Number(value);
        if (
          field.validation.min !== undefined &&
          numValue < field.validation.min
        ) {
          return `Minimum value is ${field.validation.min}`;
        }
        if (
          field.validation.max !== undefined &&
          numValue > field.validation.max
        ) {
          return `Maximum value is ${field.validation.max}`;
        }
      }

      if (field.type === "text" || field.type === "textarea") {
        const length = value?.length || 0;
        if (
          field.validation.min !== undefined &&
          length < field.validation.min
        ) {
          return `Minimum length is ${field.validation.min} characters`;
        }
        if (
          field.validation.max !== undefined &&
          length > field.validation.max
        ) {
          return `Maximum length is ${field.validation.max} characters`;
        }
        if (field.validation.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            return field.validation.message || `Invalid format`;
          }
        }
      }
    }

    return null;
  };

  const validateNestedFields = (nestedFields: FormField[], parentFieldName: string, parentValue: string, errors: Record<string, string>) => {
    nestedFields.forEach((nestedField) => {
      const nestedFieldName = `${parentFieldName}.${nestedField.name}`;
      const nestedValue = formData[nestedFieldName];
      const error = validateField(nestedField, nestedValue);
      if (error) {
        errors[nestedFieldName] = error;
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    form?.fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
      
      // Validate nested fields if option is selected
      const fieldValue = formData[field.name];
      if (fieldValue && field.options) {
        const selectedOption = field.options.find(opt => opt.value === fieldValue);
        if (selectedOption?.nestedFields) {
          validateNestedFields(selectedOption.nestedFields, field.name, fieldValue, newErrors);
        }
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && form && id) {
      try {
        setSubmitting(true);
        await api.public.submitForm(id, formData);
        toast.success("Form submitted successfully!");
        setFormData({});
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(`Failed to submit form: ${error.message}`);
        } else {
          toast.error("Failed to submit form");
        }
      } finally {
        setSubmitting(false);
      }
    } else if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors before submitting");
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [fieldName]: value };
      
      // Clear nested field values when parent field changes
      Object.keys(prev).forEach(key => {
        if (key.startsWith(`${fieldName}.`)) {
          delete newData[key];
        }
      });
      
      return newData;
    });
    
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        
        // Clear nested field errors when parent field changes
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith(`${fieldName}.`)) {
            delete newErrors[key];
          }
        });
        
        return newErrors;
      });
    }
  };

  const renderNestedFields = (nestedFields: FormField[], parentFieldName: string, parentValue: string) => {
    if (!nestedFields || nestedFields.length === 0) return null;
    
    return (
      <div className="ml-6 mt-3 space-y-4 border-l-2 border-muted pl-4">
        {nestedFields.map((nestedField) => {
          const nestedFieldName = `${parentFieldName}.${nestedField.name}`;
          const nestedValue = formData[nestedFieldName] || "";
          const nestedError = errors[nestedFieldName];
          
          return (
            <div key={nestedField.id} className="space-y-2">
              <Label htmlFor={nestedFieldName}>
                {nestedField.label}
                {nestedField.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              
              {nestedField.type === "textarea" ? (
                <Textarea
                  id={nestedFieldName}
                  value={nestedValue}
                  onChange={(e) => handleFieldChange(nestedFieldName, e.target.value)}
                  placeholder={`Enter ${nestedField.label.toLowerCase()}`}
                  className={nestedError ? "border-destructive" : ""}
                />
              ) : nestedField.type === "select" ? (
                <select
                  id={nestedFieldName}
                  value={nestedValue}
                  onChange={(e) => handleFieldChange(nestedFieldName, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-background ${
                    nestedError ? "border-destructive" : ""
                  }`}
                >
                  <option value="">Select an option</option>
                  {nestedField.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : nestedField.type === "radio" ? (
                <div className="space-y-2">
                  {nestedField.options?.map((opt) => (
                    <div key={opt.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`${nestedFieldName}-${opt.value}`}
                        name={nestedFieldName}
                        value={opt.value}
                        checked={nestedValue === opt.value}
                        onChange={(e) => handleFieldChange(nestedFieldName, e.target.value)}
                        className="cursor-pointer"
                      />
                      <label
                        htmlFor={`${nestedFieldName}-${opt.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              ) : nestedField.type === "checkbox" ? (
                <div className="space-y-2">
                  {nestedField.options?.map((opt) => (
                    <div key={opt.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`${nestedFieldName}-${opt.value}`}
                        checked={nestedValue?.[opt.value] || false}
                        onChange={(e) =>
                          handleFieldChange(nestedFieldName, {
                            ...nestedValue,
                            [opt.value]: e.target.checked,
                          })
                        }
                        className="cursor-pointer"
                      />
                      <label
                        htmlFor={`${nestedFieldName}-${opt.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <Input
                  id={nestedFieldName}
                  type={nestedField.type}
                  value={nestedValue}
                  onChange={(e) => handleFieldChange(nestedFieldName, e.target.value)}
                  placeholder={`Enter ${nestedField.label.toLowerCase()}`}
                  className={nestedError ? "border-destructive" : ""}
                />
              )}
              
              {nestedError && <p className="text-sm text-destructive">{nestedError}</p>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderField = (field: FormField, depth: number = 0) => {
    const error = errors[field.name];
    const value = formData[field.name] || "";

    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>

        {field.type === "textarea" ? (
          <Textarea
            id={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={error ? "border-destructive" : ""}
          />
        ) : field.type === "select" ? (
          <>
            <select
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-background ${
                error ? "border-destructive" : ""
              }`}
            >
              <option value="">Select an option</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {value && (() => {
              const selectedOption = field.options?.find(opt => opt.value === value);
              return selectedOption?.nestedFields && renderNestedFields(selectedOption.nestedFields, field.name, value);
            })()}
          </>
        ) : field.type === "radio" ? (
          <>
            <div className="space-y-2">
              {field.options?.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`${field.name}-${opt.value}`}
                    name={field.name}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={(e) =>
                      handleFieldChange(field.name, e.target.value)
                    }
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor={`${field.name}-${opt.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
            {value && (() => {
              const selectedOption = field.options?.find(opt => opt.value === value);
              return selectedOption?.nestedFields && renderNestedFields(selectedOption.nestedFields, field.name, value);
            })()}
          </>
        ) : field.type === "checkbox" ? (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`${field.name}-${opt.value}`}
                  checked={value?.[opt.value] || false}
                  onChange={(e) =>
                    handleFieldChange(field.name, {
                      ...value,
                      [opt.value]: e.target.checked,
                    })
                  }
                  className="cursor-pointer"
                />
                <label
                  htmlFor={`${field.name}-${opt.value}`}
                  className="text-sm cursor-pointer"
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <Input
            id={field.name}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={error ? "border-destructive" : ""}
          />
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading form...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Form not found</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{form.title}</CardTitle>
            <CardDescription className="text-base">
              {form.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.sort((a, b) => a.order - b.order).map(renderField)}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                <Send className="mr-2 h-5 w-5" />
                {submitting ? "Submitting..." : "Submit Form"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
