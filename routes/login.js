var User = require('../models/user');

exports.form = function (req, res) {
	res.render('login', { title: 'Login' });
}