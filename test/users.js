var User = require('../models/user');

User.authenticate('mlw', 'password', function (err, user) {
	console.log(err);
	console.log(user);
})