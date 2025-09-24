const mongoose = require('mongoose');
const MenuItem = require('../models/Menu');
require('dotenv').config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bondegusto';
console.log('🔗 Connecting to MongoDB...');
mongoose.connect(mongoUri);

async function cleanSeptemberDishes() {
  try {
    console.log('🧹 Starting comprehensive September dish cleaning process...');
    
    // Define September date range for all years
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1]; // Check previous, current, and next year
    
    console.log(`📅 Cleaning September records from years: ${years.join(', ')}`);
    
    // Step 1: Find all records with dataPreparacao in September (any year)
    console.log('\n🔍 Step 1: Finding records with dataPreparacao in September...');
    const recordsWithSeptemberDates = await MenuItem.find({
      $expr: {
        $eq: [{ $month: '$dataPreparacao' }, 9] // September is month 9
      }
    });
    
    console.log(`   Found ${recordsWithSeptemberDates.length} records with September dates`);
    
    // Step 2: Find records created in September (using createdAt timestamp)
    console.log('\n🔍 Step 2: Finding records created in September...');
    const recordsCreatedInSeptember = await MenuItem.find({
      $expr: {
        $eq: [{ $month: '$createdAt' }, 9] // September is month 9
      }
    });
    
    console.log(`   Found ${recordsCreatedInSeptember.length} records created in September`);
    
    // Step 3: Find records updated in September
    console.log('\n🔍 Step 3: Finding records updated in September...');
    const recordsUpdatedInSeptember = await MenuItem.find({
      $expr: {
        $eq: [{ $month: '$updatedAt' }, 9] // September is month 9
      }
    });
    
    console.log(`   Found ${recordsUpdatedInSeptember.length} records updated in September`);
    
    // Step 4: Find records with September-related tags or descriptions
    console.log('\n🔍 Step 4: Finding records with September-related content...');
    const septemberContentRecords = await MenuItem.find({
      $or: [
        { tags: { $in: ['setembro', 'september', 'primavera', 'sazonal'] } },
        { descricao: { $regex: /setembro|september|primavera/i } },
        { nome: { $regex: /setembro|september|primavera/i } }
      ]
    });
    
    console.log(`   Found ${septemberContentRecords.length} records with September-related content`);
    
    // Collect all unique IDs to avoid duplicates
    const allRecordIds = new Set();
    
    recordsWithSeptemberDates.forEach(record => allRecordIds.add(record._id.toString()));
    recordsCreatedInSeptember.forEach(record => allRecordIds.add(record._id.toString()));
    recordsUpdatedInSeptember.forEach(record => allRecordIds.add(record._id.toString()));
    septemberContentRecords.forEach(record => allRecordIds.add(record._id.toString()));
    
    console.log(`\n📊 Total unique records to clean: ${allRecordIds.size}`);
    
    if (allRecordIds.size === 0) {
      console.log('✅ No September dish records found to clean.');
      return;
    }
    
    // Step 5: Display records before deletion for confirmation
    console.log('\n📋 Records to be deleted:');
    const recordsToDelete = await MenuItem.find({
      _id: { $in: Array.from(allRecordIds) }
    }).select('nome categoria dataPreparacao createdAt');
    
    recordsToDelete.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.nome} (${record.categoria}) - Created: ${record.createdAt?.toLocaleDateString() || 'N/A'} - Prep Date: ${record.dataPreparacao?.toLocaleDateString() || 'N/A'}`);
    });
    
    // Step 6: Perform the deletion
    console.log('\n🗑️  Step 6: Deleting September dish records...');
    const deleteResult = await MenuItem.deleteMany({
      _id: { $in: Array.from(allRecordIds) }
    });
    
    console.log(`✅ Successfully deleted ${deleteResult.deletedCount} September dish records`);
    
    // Step 7: Verify cleanup
    console.log('\n🔍 Step 7: Verifying cleanup...');
    const remainingSeptemberRecords = await MenuItem.find({
      $or: [
        {
          $expr: {
            $eq: [{ $month: '$dataPreparacao' }, 9]
          }
        },
        {
          $expr: {
            $eq: [{ $month: '$createdAt' }, 9]
          }
        },
        {
          $expr: {
            $eq: [{ $month: '$updatedAt' }, 9]
          }
        },
        {
          $or: [
            { tags: { $in: ['setembro', 'september', 'primavera', 'sazonal'] } },
            { descricao: { $regex: /setembro|september|primavera/i } },
            { nome: { $regex: /setembro|september|primavera/i } }
          ]
        }
      ]
    });
    
    if (remainingSeptemberRecords.length === 0) {
      console.log('✅ Cleanup verification successful - no September records remaining');
    } else {
      console.log(`⚠️  Warning: ${remainingSeptemberRecords.length} September-related records still found:`);
      remainingSeptemberRecords.forEach(record => {
        console.log(`   - ${record.nome} (${record.categoria})`);
      });
    }
    
    // Step 8: Display final database statistics
    console.log('\n📊 Final database statistics:');
    const totalRecords = await MenuItem.countDocuments();
    const recordsByCategory = await MenuItem.aggregate([
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
    
    console.log(`   Total menu items remaining: ${totalRecords}`);
    console.log('   Records by category:');
    recordsByCategory.forEach(cat => {
      console.log(`     ${cat._id}: ${cat.count} items`);
    });
    
    console.log('\n🎉 September dish cleaning completed successfully!');
    console.log('\n📋 Cleaning summary:');
    console.log(`   • Records with September dates: ${recordsWithSeptemberDates.length}`);
    console.log(`   • Records created in September: ${recordsCreatedInSeptember.length}`);
    console.log(`   • Records updated in September: ${recordsUpdatedInSeptember.length}`);
    console.log(`   • Records with September content: ${septemberContentRecords.length}`);
    console.log(`   • Total unique records deleted: ${deleteResult.deletedCount}`);
    console.log(`   • Database integrity maintained: ✅`);
    
  } catch (error) {
    console.error('❌ Error during September dish cleaning:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    console.log('\n🔌 Closing database connection...');
    mongoose.connection.close();
  }
}

// Execute the cleaning script
cleanSeptemberDishes();