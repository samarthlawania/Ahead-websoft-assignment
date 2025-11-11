const mongoose = require('mongoose');
const Form = require('../models/form');
const Submission = require('../models/submission');

async function clearData() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/formbuilder';
    await mongoose.connect(MONGODB_URI);
    
    await Form.deleteMany({});
    await Submission.deleteMany({});
    
    console.log('All data cleared');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Clear error:', error);
  }
}

clearData();