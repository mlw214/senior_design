var User = require('../models/user');

/*User.newInstance('bob', 'password', function (err, user) {
	if (err) return console.log(err);
	user.save(function (err, prod, num) {
		if (err) return console.log(err);
		console.log('saved!');
	});
});*/

User.authenticate('bob', 'password', function (err, user) {
	if (err) return console.log(err);
	if (user) return console.log('authenticated!');
	console.log('failed!');
})