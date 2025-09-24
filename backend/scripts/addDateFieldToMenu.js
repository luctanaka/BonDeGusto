const mongoose = require('mongoose');
require('dotenv').config();

// Import the Menu model
const MenuItem = require('../models/Menu');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to get the next occurrence of a specific day of the week
const getNextDateForDay = (dayName, startDate = new Date()) => {
  const daysMap = {
    'domingo': 0,
    'segunda': 1,
    'terca': 2,
    'quarta': 3,
    'quinta': 4,
    'sexta': 5,
    'sabado': 6
  };
  
  const targetDay = daysMap[dayName];
  const currentDay = startDate.getDay();
  
  // Calculate days until target day
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7; // Next week
  }
  
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + daysUntilTarget);
  targetDate.setHours(0, 0, 0, 0); // Set to start of day
  
  return targetDate;
};

// Main migration function
const addDateFieldToMenuItems = async () => {
  try {
    console.log('Starting migration to add dataPreparacao field...');
    
    // Get all menu items that don't have dataPreparacao set
    const menuItems = await MenuItem.find({
      $or: [
        { dataPreparacao: { $exists: false } },
        { dataPreparacao: null }
      ]
    });
    
    console.log(`Found ${menuItems.length} menu items to update`);
    
    let updatedCount = 0;
    const startDate = new Date(); // Use current date as reference
    
    for (const item of menuItems) {
      if (item.diaDaSemana) {
        // Calculate the next occurrence of this day
        const preparationDate = getNextDateForDay(item.diaDaSemana, startDate);
        
        // Update the item with the preparation date
        await MenuItem.findByIdAndUpdate(item._id, {
          dataPreparacao: preparationDate
        });
        
        console.log(`Updated ${item.nome} (${item.diaDaSemana}) with date: ${preparationDate.toLocaleDateString('pt-BR')}`);
        updatedCount++;
      } else {
        console.log(`Skipping ${item.nome} - no diaDaSemana specified`);
      }
    }
    
    console.log(`\nMigration completed successfully!`);
    console.log(`Updated ${updatedCount} menu items with preparation dates`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

// Run the migration
const runMigration = async () => {
  await connectDB();
  await addDateFieldToMenuItems();
  
  console.log('\nClosing database connection...');
  await mongoose.connection.close();
  console.log('Migration script completed.');
};

// Execute if run directly
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { addDateFieldToMenuItems, getNextDateForDay };