// Main entry point for the authentication backend that starts the Express server and mounts API routes.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');

//Creates Express app and sets the port
const app = express();
const PORT = process.env.PORT || 5000;

// Starts the server after ensuring database connection
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

app.use(cors());
app.use(express.json());

//A simple health check endpoint to verify that the server is running, apprently useful for Docker, Jenkins etc.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

//Authentication & profile routes, protected by Middleware
app.use('/api/auth', authRoutes);
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Access granted',
    user: req.user,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
