const Menu = require('./models/Menu');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to database');
  
  const weeklyMenu = await Menu.getWeeklyMenu();
  console.log('Weekly menu structure:');
  
  Object.keys(weeklyMenu).forEach(day => {
    console.log(`${day}: ${weeklyMenu[day].length} dishes`);
    if(weeklyMenu[day].length > 0) {
      console.log('  Sample dishes:');
      weeklyMenu[day].slice(0, 3).forEach(dish => {
        console.log(`    - ${dish.nome} (${dish.categoria})`);
      });
    }
    console.log('');
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});