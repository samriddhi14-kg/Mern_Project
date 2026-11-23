require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_ordering');
    console.log('[SeedAdmin] Connected to MongoDB');

    const adminEmail = 'admin@foodorder.com';
    const adminPassword = 'AdminPassword123!';

    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log(`[SeedAdmin] Admin account (${adminEmail}) already exists.`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      admin = await User.create({
        name: 'Store Admin',
        email: adminEmail,
        passwordHash,
        phone: '9800000000',
        role: 'admin',
        isActive: true
      });

      console.log('--------------------------------------------------');
      console.log('[SeedAdmin] Admin account created successfully!');
      console.log(`Email:    ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log('Role:     admin');
      console.log('--------------------------------------------------');
    }

    await mongoose.disconnect();
    console.log('[SeedAdmin] Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error(`[SeedAdmin Error] ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
