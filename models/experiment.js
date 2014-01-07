var mongoose = require('mongoose');

var experimentSchema = new mongoose.Schema({
  name: { type: String, index: true },
  start: { type: Date, default: Date.now },
  stop: { type: Date, default: null },
  cancelled: Boolean,
  rate: Number,
  contact: String,
  description: { type: String, default: '' },
  camera: {
    used: Boolean,
    bound: String,
    auto: Boolean,
  },
  sensors: Object,
  path: String
});

module.exports = experimentSchema;