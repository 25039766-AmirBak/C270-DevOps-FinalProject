require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  verificationStatus: String,
});

const User = mongoose.model('User', userSchema);

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not found in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to MongoDB`);

  const existing = await User.findOne({ role: 'Admin' });
  if (existing) {
    console.log(`Admin already exists: ${existing.email}`);
  } else {
    const password = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password,
      role: 'Admin',
      verificationStatus: 'Verified',
    });
    console.log('Admin created — email: admin@example.com, password: admin123');
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
