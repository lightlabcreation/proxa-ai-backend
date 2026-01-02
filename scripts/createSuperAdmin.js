// Script to create SuperAdmin user
// Run this with: node scripts/createSuperAdmin.js

require('dotenv').config();
const db = require('../config/config');
const User = db.user;
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
  try {
    const email = 'superadmin@procxa.com';
    const password = 'SuperAdmin@123'; // SuperAdmin Password
    
    // Check if SuperAdmin already exists
    const existingSuperAdmin = await User.findOne({ 
      where: { userType: 'superadmin' } 
    });
    
    if (existingSuperAdmin) {
      console.log('SuperAdmin already exists:', existingSuperAdmin.email_id);
      console.log('If you want to create a new one, delete the existing one first.');
      process.exit(0);
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ 
      where: { email_id: email } 
    });
    
    if (existingUser) {
      console.log('User with this email already exists:', email);
      console.log('Updating to SuperAdmin...');
      existingUser.userType = 'superadmin';
      existingUser.is_active = true;
      await existingUser.save();
      console.log('✅ User updated to SuperAdmin successfully!');
      console.log('Email:', email);
      console.log('Password:', password);
      process.exit(0);
    }
    
    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create SuperAdmin
    const superAdmin = await User.create({
      email_id: email,
      password: hashedPassword,
      userType: 'superadmin',
      is_active: true
    });
    
    console.log('✅ SuperAdmin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('User ID:', superAdmin.id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating SuperAdmin:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createSuperAdmin();

