var bcrypt = require('bcrypt'),
    crypto = require('crypto'),
    shasum = crypto.createHash('sha256');

shasum.write('password');
shasum.end();
bcrypt.genSalt(12, function (err, salt) {
	if (err) return console.log(err);
	bcrypt.hash(shasum.read(), salt, function (err, hash) {
		if (err) return console.log(err);
	})
})