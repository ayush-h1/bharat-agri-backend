// seedPackages.js
const mongoose = require('mongoose');
require('dotenv').config(); // to load MONGO_URI from .env

const Package = require('./models/package'); // adjust path if needed

const packages = [
  {
    name: 'Silver',
    minInvestment: 1000,
    dailyReturnPercent: 3,
    durationDays: 30,
    isActive: true
  },
  {
    name: 'Gold',
    minInvestment: 3000,
    dailyReturnPercent: 5,
    durationDays: 30,
    isActive: true
  },
  {
    name: 'Diamond',
    minInvestment: 7000,
    dailyReturnPercent: 10,
    durationDays: 30,
    isActive: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing packages (optional)
    await Package.deleteMany({});
    console.log('Cleared existing packages');

    // Insert new packages
    const result = await Package.insertMany(packages);
    console.log(`Inserted ${result.length} packages:`);
    result.forEach(p => console.log(` - ${p.name}`));

    mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error seeding packages:', error);
    mongoose.disconnect();
  }
}

seed();