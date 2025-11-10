const express = require('express');
const Form = require('../models/form');
const Submission = require('../models/submission');
const { validateSubmission } = require('../utils/validation');

const router = express.Router();

// GET /api/forms/:id - Get public form
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

// POST /api/forms/:id/submissions - Submit form
router.post('/forms/:id/submissions', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const { answers } = req.body;
    
    // Validate submission
    const validation = validateSubmission(form, answers);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Create submission
    const submission = new Submission({
      formId: form._id,
      formVersion: form.version,
      answers,
      ip: req.ip || req.connection.remoteAddress
    });
    
    await submission.save();
    
    res.status(201).json({ id: submission._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;