var mongoose = require('mongoose');

var experimentSchema = new mongoose.Schema({
  name: { type: String, index: true },
  start: { type: Date, default: Date.now },
  stop: { type: Date, default: null },
  settings: {
    rate: Number,
    email: String,
    phone: Number
  },
  bounds: {
    camera: {
      color: String,
      auto: Boolean
    },
    sensors: [{
      name: String,
      lower: Number,
      upper: Number,
      auto: Boolean
    }]
  },
  path: String
});

module.exports = experimentSchema;