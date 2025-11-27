const mongoose = require('mongoose');

// Schema for test data
const testSchema = new mongoose.Schema({
  name: String
});

module.exports = mongoose.model('Test', testSchema);
