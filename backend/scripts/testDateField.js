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

// Test function to verify date field
const testDateField = async () => {
  try {
    console.log('Testing dataPreparacao field...');
    
    // Get a few menu items to verify the date field
    const menuItems = await MenuItem.find({}).limit(5).select('nome diaDaSemana dataPreparacao');
    
    console.log('\nSample menu items with preparation dates:');
    console.log('=' .repeat(60));
    
    menuItems.forEach(item => {
      const formattedDate = item.dataPreparacao 
        ? item.dataPreparacao.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : 'No date set';
      
      console.log(`${item.nome}`);
      console.log(`  Day: ${item.diaDaSemana || 'Not set'}`);
      console.log(`  Preparation Date: ${formattedDate}`);
      console.log('');
    });
    
    // Test querying by date range
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const itemsThisWeek = await MenuItem.find({
      dataPreparacao: {
        $gte: today,
        $lte: nextWeek
      }
    }).select('nome diaDaSemana dataPreparacao');
    
    console.log(`\nItems scheduled for this week (${today.toLocaleDateString('pt-BR')} - ${nextWeek.toLocaleDateString('pt-BR')}):`);
    console.log('=' .repeat(60));
    
    if (itemsThisWeek.length > 0) {
      itemsThisWeek.forEach(item => {
        const formattedDate = item.dataPreparacao.toLocaleDateString('pt-BR');
        console.log(`${item.nome} - ${item.diaDaSemana} (${formattedDate})`);
      });
    } else {
      console.log('No items found for this week.');
    }
    
    console.log('\n✅ Date field test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during date field test:', error);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testDateField();
  
  console.log('\nClosing database connection...');
  await mongoose.connection.close();
  console.log('Test completed.');
};

// Execute if run directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { testDateField };