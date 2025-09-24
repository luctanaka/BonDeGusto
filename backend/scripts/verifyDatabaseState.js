const mongoose = require('mongoose');
const MenuItem = require('../models/Menu');
require('dotenv').config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bondegusto';
console.log('🔗 Connecting to MongoDB...');
mongoose.connect(mongoUri);

async function verifyDatabaseState() {
  try {
    console.log('🔍 Verifying current database state...');
    
    // Get total count of all menu items
    const totalCount = await MenuItem.countDocuments();
    console.log(`\n📊 Total menu items in database: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('✅ Database is completely clean - no menu items found.');
      return;
    }
    
    // Get count by category
    console.log('\n📋 Menu items by category:');
    const categoryStats = await MenuItem.aggregate([
      {
        $group: {
          _id: '$categoria',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} items`);
    });
    
    // Check for any records with dates
    console.log('\n📅 Records with dataPreparacao field:');
    const recordsWithDates = await MenuItem.find({
      dataPreparacao: { $exists: true, $ne: null }
    }).select('nome categoria dataPreparacao createdAt').limit(10);
    
    if (recordsWithDates.length === 0) {
      console.log('   No records found with dataPreparacao field');
    } else {
      console.log(`   Found ${recordsWithDates.length} records with dates (showing first 10):`);
      recordsWithDates.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.nome} - Prep: ${record.dataPreparacao?.toLocaleDateString() || 'N/A'} - Created: ${record.createdAt?.toLocaleDateString() || 'N/A'}`);
      });
    }
    
    // Check creation dates
    console.log('\n🕒 Recent records by creation date:');
    const recentRecords = await MenuItem.find({})
      .select('nome categoria createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    
    if (recentRecords.length === 0) {
      console.log('   No records found');
    } else {
      console.log(`   Most recent ${Math.min(10, recentRecords.length)} records:`);
      recentRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.nome} (${record.categoria}) - Created: ${record.createdAt?.toLocaleDateString() || 'N/A'}`);
      });
    }
    
    // Check for September-related content
    console.log('\n🔍 Checking for any September-related content:');
    const septemberContent = await MenuItem.find({
      $or: [
        { nome: { $regex: /setembro|september|primavera/i } },
        { descricao: { $regex: /setembro|september|primavera/i } },
        { tags: { $in: ['setembro', 'september', 'primavera', 'sazonal'] } }
      ]
    }).select('nome categoria tags');
    
    if (septemberContent.length === 0) {
      console.log('   ✅ No September-related content found');
    } else {
      console.log(`   ⚠️  Found ${septemberContent.length} records with September-related content:`);
      septemberContent.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.nome} (${record.categoria}) - Tags: ${record.tags?.join(', ') || 'None'}`);
      });
    }
    
    // Check date ranges
    console.log('\n📊 Date range analysis:');
    const dateStats = await MenuItem.aggregate([
      {
        $match: {
          $or: [
            { dataPreparacao: { $exists: true, $ne: null } },
            { createdAt: { $exists: true, $ne: null } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          minPrepDate: { $min: '$dataPreparacao' },
          maxPrepDate: { $max: '$dataPreparacao' },
          minCreatedDate: { $min: '$createdAt' },
          maxCreatedDate: { $max: '$createdAt' },
          totalWithPrepDate: {
            $sum: {
              $cond: [{ $ne: ['$dataPreparacao', null] }, 1, 0]
            }
          },
          totalWithCreatedDate: {
            $sum: {
              $cond: [{ $ne: ['$createdAt', null] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    if (dateStats.length > 0) {
      const stats = dateStats[0];
      console.log(`   Records with preparation dates: ${stats.totalWithPrepDate}`);
      console.log(`   Records with creation dates: ${stats.totalWithCreatedDate}`);
      if (stats.minPrepDate) {
        console.log(`   Preparation date range: ${stats.minPrepDate.toLocaleDateString()} to ${stats.maxPrepDate.toLocaleDateString()}`);
      }
      if (stats.minCreatedDate) {
        console.log(`   Creation date range: ${stats.minCreatedDate.toLocaleDateString()} to ${stats.maxCreatedDate.toLocaleDateString()}`);
      }
    } else {
      console.log('   No date information available');
    }
    
    console.log('\n✅ Database state verification completed!');
    
  } catch (error) {
    console.error('❌ Error during database verification:', error);
  } finally {
    console.log('\n🔌 Closing database connection...');
    mongoose.connection.close();
  }
}

// Execute the verification script
verifyDatabaseState();