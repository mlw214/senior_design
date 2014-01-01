var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Experiment = require('./experiment');

var userSchema = new mongoose.Schema({
  username: { type: String, index: true },
  password: String,
  contact: {
    email: { type: String, default: null },
    cellphone: { type: Number, default: null },
    carrier: { type: String, default: null }
  },
  experiments: [Experiment]
});

userSchema.statics.authenticate = function (name, pass, fn) {
  this.findOne({ username: name }, function (err, doc) {
    if (err) return fn(err);
    if (!doc) return fn();
    var user = doc;
    bcrypt.compare(pass, user.password, function (err, res) {
      if (err) return fn(err);
      if (res) return fn(null, user);
      fn();
    })
  });
};

userSchema.statics.newInstance = function (name, pass, fn) {
  var model = this;
  this.findOne({ username: name }, function (err, doc) {
    if (err) return fn(err);
    if (doc) return fn();
    var user = new model({ username: name });
    bcrypt.genSalt(12, function (err, salt) {
      if (err) return fn(err);
      bcrypt.hash(pass, salt, function (err, hash) {
        if (err) return fn(err);
        user.password = hash;
        fn(null, user);
      });
    });
  });
};

module.exports = mongoose.model('User', userSchema);