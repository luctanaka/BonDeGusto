require('dotenv').config();
const mongoose = require('mongoose');
const Menu = require('../models/Menu');

async function testMenuQuery() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test different queries
    console.log('\n📊 Testing menu queries...');
    
    // Count all documents
    const totalCount = await Menu.countDocuments();
    console.log(`Total menu items in database: ${totalCount}`);
    
    // Find all items (no filter)
    const allItems = await Menu.find();
    console.log(`All items found: ${allItems.length}`);
    
    // Find available items
    const availableItems = await Menu.find({ disponivel: true });
    console.log(`Available items: ${availableItems.length}`);
    
    // Show first few items
    if (allItems.length > 0) {
      console.log('\n📋 First 3 items:');
      allItems.slice(0, 3).forEach(item => {
        console.log(`- ${item.nome} (${item.categoria}) - R$ ${item.preco} - Disponível: ${item.disponivel}`);
      });
    }
    
    // Test the exact query from the API
    console.log('\n🔍 Testing API query...');
    const apiQuery = await Menu.find({ disponivel: true }).sort({ categoria: 1, nome: 1 });
    console.log(`API query result: ${apiQuery.length} items`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testMenuQuery();