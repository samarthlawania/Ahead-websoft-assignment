const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Form = require('../models/form');
const Submission = require('../models/submission');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(requireAuth);

// GET /api/admin/forms - List all forms (active versions only)
router.get('/forms', async (req, res) => {
  try {
    const forms = await Form.find({ isActive: true, userId: req.user._id }).sort({ createdAt: -1 });
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
      fields: processedFields,
      userId: req.user._id
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
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/forms/:id - Update form (creates new version)
router.put('/forms/:id', async (req, res) => {
  try {
    const { title, description, fields = [] } = req.body;
    
    const currentForm = await Form.findOne({ _id: req.params.id, userId: req.user._id });
    if (!currentForm) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const processedFields = fields.map((field, index) => ({
      ...field,
      id: field.id || uuidv4(),
      order: field.order !== undefined ? field.order : index
    }));
    
    // Deactivate current version
    await Form.findByIdAndUpdate(req.params.id, { isActive: false });
    
    // Create new version
    const newForm = new Form({
      title,
      description,
      fields: processedFields,
      version: currentForm.version + 1,
      parentFormId: currentForm.parentFormId || currentForm._id,
      isActive: true,
      userId: req.user._id
    });
    
    await newForm.save();
    res.json(newForm);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/forms/:id - Delete form
router.delete('/forms/:id', async (req, res) => {
  try {
    const form = await Form.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
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
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
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
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
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
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
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

// GET /api/admin/forms/:id/submissions - List form submissions with pagination and filtering
router.get('/forms/:id/submissions', async (req, res) => {
  try {
    // First verify the form belongs to the user
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Get all form versions (current and previous)
    const allFormVersions = await Form.find({ 
      $or: [
        { _id: req.params.id },
        { parentFormId: form.parentFormId || req.params.id },
        { _id: form.parentFormId }
      ],
      userId: req.user._id
    }).select('_id version').sort({ version: -1 });
    
    const formIds = allFormVersions.map(f => f._id);
    const latestFormId = allFormVersions[0]._id;
    
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      search,
      version
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter query - use latest form ID for filtering but show all versions
    const filter = { formId: { $in: formIds } };
    
    if (version) {
      filter.formVersion = parseInt(version);
    }
    
    if (startDate || endDate) {
      filter.submittedAt = {};
      if (startDate) filter.submittedAt.$gte = new Date(startDate);
      if (endDate) filter.submittedAt.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$or = [
        { 'answers': { $regex: search, $options: 'i' } },
        { ip: { $regex: search, $options: 'i' } }
      ];
    }
    
    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('formId', 'title version');
    
    const total = await Submission.countDocuments(filter);
    
    // Get available versions
    const submissionVersions = await Submission.distinct('formVersion', { formId: { $in: formIds } });
    const formVersions = allFormVersions.map(f => f.version);
    const versions = [...new Set([...submissionVersions, ...formVersions])];
    
    res.json({
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        versions: versions.sort((a, b) => b - a)
      },
      latestFormId: latestFormId.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/upload - Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      url: fileUrl,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;