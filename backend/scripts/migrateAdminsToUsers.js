const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Admin = require('../models/Admin');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bondegusto');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function
const migrateAdminsToUsers = async () => {
  try {
    console.log('Starting admin to user migration...');
    
    // Get all existing admins
    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admin(s) to migrate`);
    
    if (admins.length === 0) {
      console.log('No admins found to migrate');
      return;
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const admin of admins) {
      try {
        // Check if user with this email already exists
        const existingUser = await User.findOne({ email: admin.email });
        
        if (existingUser) {
          console.log(`User with email ${admin.email} already exists. Updating to admin...`);
          
          // Update existing user to be admin
          existingUser.isAdmin = true;
          existingUser.adminRole = admin.role || 'admin';
          await existingUser.save();
          
          console.log(`Updated existing user ${admin.email} to admin`);
        } else {
          // Create new user from admin data
          const newUser = new User({
            email: admin.email,
            password: admin.password, // Password is already hashed in Admin model
            firstName: admin.username || 'Admin',
            lastName: 'User',
            restaurant: null, // Admins don't have a specific restaurant
            phone: '',
            isActive: true,
            emailVerified: true,
            isAdmin: true,
            adminRole: admin.role || 'admin',
            lastLogin: admin.lastLogin || null,
            createdBy: admin._id // Use admin ID as creator
          });
          
          await newUser.save();
          console.log(`Created new user from admin: ${admin.email}`);
        }
        
        migratedCount++;
        
      } catch (error) {
        console.error(`Error migrating admin ${admin.email}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\nMigration completed:`);
    console.log(`- Migrated: ${migratedCount}`);
    console.log(`- Skipped: ${skippedCount}`);
    console.log(`- Total: ${admins.length}`);
    
    // Ask user if they want to remove the Admin collection
    console.log('\n⚠️  IMPORTANT: After verifying the migration worked correctly,');
    console.log('you may want to remove the Admin collection and model from your codebase.');
    console.log('\nTo remove admin data after verification:');
    console.log('1. Test the new login system thoroughly');
    console.log('2. Run: db.admins.drop() in MongoDB shell');
    console.log('3. Remove the Admin model file: backend/models/Admin.js');
    console.log('4. Remove admin routes if they exist');
    
  } catch (error) {
    console.error('Migration error:', error);
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  await migrateAdminsToUsers();
  await mongoose.connection.close();
  console.log('\nMigration script completed. Database connection closed.');
};

// Execute if run directly
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { migrateAdminsToUsers };