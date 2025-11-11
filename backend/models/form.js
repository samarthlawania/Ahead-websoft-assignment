const mongoose = require('mongoose');

const FieldOptionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
  nestedFields: [{
    id: String,
    name: String,
    label: String,
    type: { type: String, enum: ['text', 'textarea', 'number', 'email', 'date', 'checkbox', 'radio', 'select'] },
    required: { type: Boolean, default: false },
    options: [{ value: String, label: String }],
    validation: {
      min: Number,
      max: Number,
      pattern: String,
      message: String
    },
    order: Number
  }]
}, { _id: false });

const FieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'textarea', 'number', 'email', 'date', 'checkbox', 'radio', 'select']
  },
  required: { type: Boolean, default: false },
  options: [FieldOptionSchema],
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    message: String
  },
  order: { type: Number, required: true }
}, { _id: false });

const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  version: { type: Number, default: 1 },
  fields: [FieldSchema],
  isActive: { type: Boolean, default: true },
  parentFormId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Form', FormSchema);