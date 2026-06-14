require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const TrainingProject = require('./models/TrainingProject');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const companies = await Company.find();
    console.log('\n🏢 COMPANIES IN DB:');
    companies.forEach(c => {
      console.log(`- ${c.name} (ID: ${c._id})`);
    });

    const projects = await TrainingProject.find().populate('companyId');
    console.log('\n📁 TRAINING PROJECTS IN DB:');
    projects.forEach(p => {
      console.log(`- ${p.projectName} (ID: ${p._id}, Company: ${p.companyId?.name || 'none'}, Media Count: ${p.media?.length || 0})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
