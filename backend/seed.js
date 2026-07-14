// Run with: npm run seed
// This adds sample food donations and family locations to your database
// so the app has real data to display. Safe to run more than once —
// it skips seeding a collection if it already has documents.

require('dotenv').config();
const mongoose = require('mongoose');
const FoodDonation = require('./models/FoodDonation');
const FamilyLocation = require('./models/FamilyLocation');

const sampleFood = [
  { foodName: 'Rice', quantity: 20, location: 'RP', expiryDate: new Date('2026-08-01'), status: 'Available' },
  { foodName: 'Canned Beans', quantity: 40, location: 'AMK Community Centre', expiryDate: new Date('2026-09-15'), status: 'Available' },
  { foodName: 'Fresh Vegetables', quantity: 15, location: 'Jurong Point', expiryDate: new Date('2026-07-20'), status: 'Available' },
  { foodName: 'Bread Loaves', quantity: 30, location: 'Toa Payoh Hub', expiryDate: new Date('2026-07-18'), status: 'Available' },
  { foodName: 'Milk Powder', quantity: 10, location: 'RP', expiryDate: new Date('2026-10-01'), status: 'Available' },
];

const sampleLocations = [
  { address: 'Blk 123 Ang Mo Kio Ave 3, #05-456', area: 'Ang Mo Kio' },
  { address: 'Blk 88 Jurong West St 41, #02-123', area: 'Jurong' },
  { address: 'Blk 45 Toa Payoh Lorong 6, #10-789', area: 'Toa Payoh' },
  { address: 'Blk 210 Sengkang East Way, #07-321', area: 'Sengkang' },
  { address: 'Blk 77 Bedok North Ave 2, #03-654', area: 'Bedok' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  const foodCount = await FoodDonation.countDocuments();
  if (foodCount === 0) {
    await FoodDonation.insertMany(sampleFood);
    console.log(`Inserted ${sampleFood.length} sample food donations.`);
  } else {
    console.log(`Skipped food seeding — ${foodCount} documents already exist.`);
  }

  const locationCount = await FamilyLocation.countDocuments();
  if (locationCount === 0) {
    await FamilyLocation.insertMany(sampleLocations);
    console.log(`Inserted ${sampleLocations.length} sample family locations.`);
  } else {
    console.log(`Skipped location seeding — ${locationCount} documents already exist.`);
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
