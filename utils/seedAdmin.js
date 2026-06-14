require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await AdminUser.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
      console.log('⚠️  Admin already exists:', existing.email);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    const admin = await AdminUser.create({
      email: process.env.ADMIN_EMAIL,
      passwordHash,
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Password:', process.env.ADMIN_PASSWORD);
    console.log('\n🔐 Please change the admin password after first login.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
