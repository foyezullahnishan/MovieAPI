// config/config.js
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/movie-database',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtExpire: '30d',
};

module.exports = config;