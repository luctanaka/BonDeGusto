const mongoose = require('mongoose');
const Menu = require('../models/Menu');
require('dotenv').config();

async function checkDayField() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bondegusto');
    console.log('✅ Connected to database');

    const sample = await Menu.find({}).limit(10);
    console.log('\n📋 Sample records with diaDaSemana field:');
    
    sample.forEach((item, i) => {
      console.log(`${i+1}. ${item.nome}`);
      console.log(`   - diaDaSemana: ${item.diaDaSemana || 'NOT SET'}`);
      console.log(`   - dataPreparacao: ${item.dataPreparacao}`);
      console.log(`   - categoria: ${item.categoria}`);
      console.log('');
    });

    // Check how many records have diaDaSemana set
    const totalRecords = await Menu.countDocuments({});
    const recordsWithDay = await Menu.countDocuments({ diaDaSemana: { $exists: true, $ne: null } });
    
    console.log(`\n📊 Statistics:`);
    console.log(`   Total records: ${totalRecords}`);
    console.log(`   Records with diaDaSemana: ${recordsWithDay}`);
    console.log(`   Records without diaDaSemana: ${totalRecords - recordsWithDay}`);

    // Check distribution by day
    const dayDistribution = await Menu.aggregate([
      { $match: { diaDaSemana: { $exists: true, $ne: null } } },
      { $group: { _id: '$diaDaSemana', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📅 Distribution by day:');
    dayDistribution.forEach(day => {
      console.log(`   ${day._id}: ${day.count} dishes`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('\n🔌 Closing database connection...');
    await mongoose.connection.close();
  }
}

checkDayField();