const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  refreshToken: String,
  userAgent: String,
  ip: String
});

module.exports = mongoose.model('Session', sessionSchema);