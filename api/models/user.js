const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  did: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  emailVerified: { type: Boolean, default: false },
  mobile: { type: String, default: '' },
  extraDid: { type: Array, default: [] },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
