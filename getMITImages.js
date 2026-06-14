require('dotenv').config();
const mongoose = require('mongoose');
const TrainingProject = require('./models/TrainingProject');

async function getMIT() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trainer-portfolio');
    console.log('✅ Connected to MongoDB');

    const mitProject = await TrainingProject.findById('6a2ea8d2ff4c8502f0b2a502');
    if (!mitProject) {
      console.log('❌ Cyber Security project not found in database');
      process.exit(0);
    }

    console.log(`\n📁 PROJECT FOUND: ${mitProject.projectName}`);
    console.log('MEDIA ITEMS:');
    console.log(JSON.stringify(mitProject.media, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getMIT();
