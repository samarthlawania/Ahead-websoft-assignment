const mongoose = require('mongoose');
const Form = require('../models/form');
const Submission = require('../models/submission');
const User = require('../models/user');

const sampleForms = [
  {
    title: 'Contact Form',
    description: 'Basic contact form for customer inquiries',
    fields: [
      { id: 'name', name: 'name', label: 'Full Name', type: 'text', required: true, order: 1 },
      { id: 'email', name: 'email', label: 'Email Address', type: 'email', required: true, order: 2 },
      { id: 'message', name: 'message', label: 'Message', type: 'textarea', required: true, order: 3 }
    ]
  },
  {
    title: 'Survey Form',
    description: 'Customer satisfaction survey',
    fields: [
      { id: 'rating', name: 'rating', label: 'Rating', type: 'radio', required: true, order: 1, options: [{ value: 'excellent', label: 'Excellent' }, { value: 'good', label: 'Good' }, { value: 'poor', label: 'Poor' }] },
      { id: 'feedback', name: 'feedback', label: 'Feedback', type: 'textarea', required: false, order: 2 }
    ]
  },
  {
    title: 'Registration Form',
    description: 'Event registration form',
    fields: [
      { id: 'fullname', name: 'fullname', label: 'Full Name', type: 'text', required: true, order: 1 },
      { id: 'age', name: 'age', label: 'Age', type: 'number', required: true, order: 2 },
      { id: 'eventdate', name: 'eventdate', label: 'Event Date', type: 'date', required: true, order: 3 }
    ]
  },
  {
    title: 'Job Application',
    description: 'Job application form',
    fields: [
      { id: 'applicantname', name: 'applicantname', label: 'Name', type: 'text', required: true, order: 1 },
      { id: 'position', name: 'position', label: 'Position', type: 'select', required: true, order: 2, options: [{ value: 'developer', label: 'Developer' }, { value: 'designer', label: 'Designer' }, { value: 'manager', label: 'Manager' }] },
      { id: 'experience', name: 'experience', label: 'Experience', type: 'number', required: true, order: 3 }
    ]
  },
  {
    title: 'Feedback Form',
    description: 'Product feedback form',
    fields: [
      { id: 'product', name: 'product', label: 'Product', type: 'text', required: true, order: 1 },
      { id: 'score', name: 'score', label: 'Score', type: 'number', required: true, order: 2 },
      { id: 'recommend', name: 'recommend', label: 'Recommend', type: 'checkbox', required: false, order: 3, options: [{ value: 'yes', label: 'Yes' }] }
    ]
  },
  {
    title: 'Newsletter Signup',
    description: 'Newsletter subscription form',
    fields: [
      { id: 'subscriberemail', name: 'subscriberemail', label: 'Email', type: 'email', required: true, order: 1 },
      { id: 'interests', name: 'interests', label: 'Interests', type: 'checkbox', required: false, order: 2, options: [{ value: 'tech', label: 'Technology' }, { value: 'business', label: 'Business' }] }
    ]
  },
  {
    title: 'Support Ticket',
    description: 'Customer support ticket form',
    fields: [
      { id: 'issue', name: 'issue', label: 'Issue', type: 'text', required: true, order: 1 },
      { id: 'priority', name: 'priority', label: 'Priority', type: 'radio', required: true, order: 2, options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }] },
      { id: 'description', name: 'description', label: 'Description', type: 'textarea', required: true, order: 3 }
    ]
  },
  {
    title: 'Order Form',
    description: 'Product order form',
    fields: [
      { id: 'customername', name: 'customername', label: 'Customer Name', type: 'text', required: true, order: 1 },
      { id: 'quantity', name: 'quantity', label: 'Quantity', type: 'number', required: true, order: 2 },
      { id: 'orderdate', name: 'orderdate', label: 'Order Date', type: 'date', required: true, order: 3 }
    ]
  },
  {
    title: 'Booking Form',
    description: 'Appointment booking form',
    fields: [
      { id: 'clientname', name: 'clientname', label: 'Client Name', type: 'text', required: true, order: 1 },
      { id: 'service', name: 'service', label: 'Service', type: 'select', required: true, order: 2, options: [{ value: 'consultation', label: 'Consultation' }, { value: 'meeting', label: 'Meeting' }] },
      { id: 'bookingdate', name: 'bookingdate', label: 'Booking Date', type: 'date', required: true, order: 3 }
    ]
  },
  {
    title: 'Quiz Form',
    description: 'Knowledge quiz form',
    fields: [
      { id: 'participant', name: 'participant', label: 'Participant Name', type: 'text', required: true, order: 1 },
      { id: 'answer1', name: 'answer1', label: 'Question 1', type: 'radio', required: true, order: 2, options: [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }, { value: 'c', label: 'Option C' }] },
      { id: 'answer2', name: 'answer2', label: 'Question 2', type: 'radio', required: true, order: 3, options: [{ value: 'x', label: 'Option X' }, { value: 'y', label: 'Option Y' }] }
    ]
  }
];

const generateSubmissions = (formId, formVersion, fields) => {
  const submissions = [];
  const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson', 'Diana Davis', 'Eve Miller', 'Frank Garcia', 'Grace Lee', 'Henry Taylor', 'Ivy Anderson', 'Jack Thomas', 'Kate Jackson', 'Liam White', 'Mia Harris', 'Noah Martin', 'Olivia Thompson', 'Paul Garcia', 'Quinn Rodriguez', 'Ruby Lewis'];
  const emails = ['john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com', 'charlie@example.com', 'diana@example.com', 'eve@example.com', 'frank@example.com', 'grace@example.com', 'henry@example.com', 'ivy@example.com', 'jack@example.com', 'kate@example.com', 'liam@example.com', 'mia@example.com', 'noah@example.com', 'olivia@example.com', 'paul@example.com', 'quinn@example.com', 'ruby@example.com'];
  
  for (let i = 0; i < 20; i++) {
    const answers = {};
    const submissionDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days
    
    fields.forEach(field => {
      switch (field.type) {
        case 'text':
          answers[field.name] = names[i] || `User ${i + 1}`;
          break;
        case 'email':
          answers[field.name] = emails[i] || `user${i + 1}@example.com`;
          break;
        case 'number':
          answers[field.name] = Math.floor(Math.random() * 50) + 1;
          break;
        case 'date':
          answers[field.name] = new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'textarea':
          answers[field.name] = `Sample message ${i + 1} with some detailed content.`;
          break;
        case 'radio':
          if (field.options) answers[field.name] = field.options[Math.floor(Math.random() * field.options.length)].value;
          break;
        case 'select':
          if (field.options) answers[field.name] = field.options[Math.floor(Math.random() * field.options.length)].value;
          break;
        case 'checkbox':
          if (field.options) {
            const checkboxAnswers = {};
            field.options.forEach(option => {
              checkboxAnswers[option.value] = Math.random() > 0.5;
            });
            answers[field.name] = checkboxAnswers;
          }
          break;
      }
    });
    
    submissions.push({
      formId,
      formVersion,
      answers,
      submittedAt: submissionDate,
      ip: '127.0.0.1'
    });
  }
  
  return submissions;
};

async function seedData() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/formbuilder';
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }
    
    // Create sample users
    const sampleUsers = [
      { email: 'admin1@example.com', password: 'password123' },
      { email: 'admin2@example.com', password: 'password123' },
      { email: 'admin3@example.com', password: 'password123' }
    ];
    
    let users = [];
    for (const userData of sampleUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`Created user: ${user.email}`);
      }
      users.push(user);
    }
    
    const existingForms = await Form.countDocuments();
    console.log(`Found ${existingForms} existing forms`);
    
    if (existingForms === 0) {
      // Distribute forms among users
      const formsWithUsers = sampleForms.map((form, index) => ({
        ...form,
        userId: users[index % users.length]._id
      }));
      
      const createdForms = await Form.insertMany(formsWithUsers);
      console.log(`Created ${createdForms.length} sample forms`);
      
      // Create submissions for each form
      for (const form of createdForms) {
        const submissions = generateSubmissions(form._id, form.version, form.fields);
        await Submission.insertMany(submissions);
        console.log(`Created ${submissions.length} submissions for ${form.title}`);
      }
      console.log('All sample data created successfully');
    } else {
      console.log('Forms already exist, skipping seed');
    }
    
    if (require.main === module) {
      await mongoose.disconnect();
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
}

if (require.main === module) {
  seedData().then(() => {
    console.log('Seed completed');
    process.exit(0);
  }).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = seedData;