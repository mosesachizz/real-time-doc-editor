const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: String,
  name: String
});

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: Object,
    default: { ops: [] }
  },
  revision: {
    type: Number,
    default: 0
  },
  users: [userSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', documentSchema);