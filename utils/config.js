if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

module.exports = {
  PORT: process.env.PORT || 5050,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_KEY: process.env.JWT_KEY,
  ZK: process.env.ZEN_KEY
};
