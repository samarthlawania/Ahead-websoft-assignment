const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Form = require('../models/form');
const Submission = require('../models/submission');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(requireAuth);

// GET /api/admin/forms - List all forms
router.get('/forms', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/forms - Create new form
router.post('/forms', async (req, res) => {
  try {
    const { title, description, fields = [] } = req.body;
    
    const processedFields = fields.map((field, index) => ({
      ...field,
      id: field.id || uuidv4(),
      order: field.order !== undefined ? field.order : index
    }));
    
    const form = new Form({
      title,
      description,
      fields: processedFields
    });
    
    await form.save();
    res.status(201).json(form);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/admin/forms/:id - Get form by ID
router.get('/forms/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/forms/:id - Update form (increments version)
router.put('/forms/:id', async (req, res) => {
  try {
    const { title, description, fields = [] } = req.body;
    
    const processedFields = fields.map((field, index) => ({
      ...field,
      id: field.id || uuidv4(),
      order: field.order !== undefined ? field.order : index
    }));
    
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        fields: processedFields,
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    );
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json(form);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/forms/:id - Delete form
router.delete('/forms/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/forms/:id/fields - Add field to form
router.post('/forms/:id/fields', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const field = {
      ...req.body,
      id: req.body.id || uuidv4(),
      order: req.body.order !== undefined ? req.body.order : form.fields.length
    };
    
    form.fields.push(field);
    form.version += 1;
    await form.save();
    
    res.status(201).json(field);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/admin/forms/:id/fields/:fieldId - Update field
router.put('/forms/:id/fields/:fieldId', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const fieldIndex = form.fields.findIndex(f => f.id === req.params.fieldId);
    if (fieldIndex === -1) {
      return res.status(404).json({ error: 'Field not found' });
    }
    
    form.fields[fieldIndex] = { ...form.fields[fieldIndex].toObject(), ...req.body };
    form.version += 1;
    await form.save();
    
    res.json(form.fields[fieldIndex]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/forms/:id/fields/:fieldId - Delete field
router.delete('/forms/:id/fields/:fieldId', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const fieldIndex = form.fields.findIndex(f => f.id === req.params.fieldId);
    if (fieldIndex === -1) {
      return res.status(404).json({ error: 'Field not found' });
    }
    
    form.fields.splice(fieldIndex, 1);
    form.version += 1;
    await form.save();
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/forms/:id/submissions - List form submissions with pagination
router.get('/forms/:id/submissions', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const submissions = await Submission.find({ formId: req.params.id })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Submission.countDocuments({ formId: req.params.id });
    
    res.json({
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;