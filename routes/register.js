var User = require('../models/user');

exports.form = function (req, res) {
	res.render('register', { title: 'Register' });
};

exports.submit = function (req, res, next) {
	var data = req.body.user;
	User.findOne({ username: data.name }, function (err, doc) {
		if (err) return next(err);
		if (doc) {
			res.error('Username already taken!');
			res.redirect('back');
		} else {
			User.newInstance(data.name, data.pass, function (err, user) {
				if (err) return next(err);
				user.save(function (err, product, numAffected) {
					if (err) return next(err);
					res.redirect('/');
				});
			});
		}
	});
};