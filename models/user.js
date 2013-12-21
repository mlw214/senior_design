var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost/lab');

var userSchema = new mongoose.Schema({
	username: { type: String, index: true },
	salt: String,
	password: String
});

userSchema.statics.authenticate = function (name, pass, fn) {
	this.findOne({ username: name }, function (err, doc) {
		if (err) return fn(err);
		if (!doc) return fn();
		var user = doc;
		bcrypt.hash(pass, user.salt, function (err, hash) {
			if (err) return fn(err);
			if (hash == user.password) return fn(null, user);
			fn();
		});
	});
};
// Test for null name and pass?
userSchema.statics.newInstance = function (name, pass, fn) {
	var model = this;
	this.findOne({ username: name }, function (err, doc) {
		if (err) return fn(err);
		if (doc) return fn();
		var user = new model({ username: name });
		bcrypt.genSalt(12, function (err, salt) {
			if (err) return fn(err);
			user.salt = salt;
			bcrypt.hash(pass, salt, function (err, hash) {
				if (err) return fn(err);
				user.password = hash;
				fn(null, user);
			});
		});
	});
};

module.exports = mongoose.model('User', userSchema);