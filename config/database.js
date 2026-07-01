// Handles the MongoDB connection setup for the backend application.
const mongoose = require('mongoose');
require('dotenv').config();

//Temporary
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI is not defined. Skipping MongoDB connection.');
    return null;
  }

  //Connect to MongoDB using the connection string from .env file
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    return null;
  } //error-handling
};

module.exports = connectDB;
