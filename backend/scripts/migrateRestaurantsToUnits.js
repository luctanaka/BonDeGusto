const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Restaurant = require('../models/Restaurant');
const Unit = require('../models/Unit');
const User = require('../models/User');

async function migrateRestaurantsToUnits() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bondegusto');
    console.log('Connected to MongoDB');

    // Get an admin user to use as createdBy
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('Starting migration from restaurants to units...');

    // Get all existing restaurants
    const restaurants = await Restaurant.find({});
    console.log(`Found ${restaurants.length} restaurants to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    // Migrate existing restaurants to units
    for (const restaurant of restaurants) {
      try {
        // Check if unit already exists
        const existingUnit = await Unit.findOne({ key: restaurant.key });
        if (existingUnit) {
          console.log(`Unit with key '${restaurant.key}' already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Create new unit with simplified data
        const newUnit = new Unit({
          name: restaurant.name,
          key: restaurant.key,
          isActive: restaurant.isActive,
          createdBy: adminUser._id
        });

        await newUnit.save();
        console.log(`Migrated restaurant '${restaurant.name}' to unit`);
        migratedCount++;
      } catch (error) {
        console.error(`Error migrating restaurant '${restaurant.name}':`, error.message);
        skippedCount++;
      }
    }

    // Add the 4 new units requested
    const newUnits = [
      { name: 'Bondegusto - Matriz', key: 'matriz' },
      { name: 'Bondegusto - Sandene', key: 'sandene' },
      { name: 'Bondegusto - Energizer', key: 'energizer' },
      { name: 'Bondegusto - Natto', key: 'natto' }
    ];

    console.log('\nAdding new units...');
    let newUnitsAdded = 0;

    for (const unitData of newUnits) {
      try {
        // Check if unit already exists
        const existingUnit = await Unit.findOne({ key: unitData.key });
        if (existingUnit) {
          console.log(`Unit '${unitData.name}' already exists, skipping...`);
          continue;
        }

        const newUnit = new Unit({
          name: unitData.name,
          key: unitData.key,
          isActive: true,
          createdBy: adminUser._id
        });

        await newUnit.save();
        console.log(`Added new unit: ${unitData.name}`);
        newUnitsAdded++;
      } catch (error) {
        console.error(`Error adding unit '${unitData.name}':`, error.message);
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Restaurants migrated: ${migratedCount}`);
    console.log(`Restaurants skipped: ${skippedCount}`);
    console.log(`New units added: ${newUnitsAdded}`);
    console.log('\n=== Post-Migration Instructions ===');
    console.log('1. Test the new unit system');
    console.log('2. Update routes and services to use Unit model');
    console.log('3. Consider dropping the restaurants collection after testing');
    console.log('4. Update frontend to use units instead of restaurants');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the migration
migrateRestaurantsToUnits();