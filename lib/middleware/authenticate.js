module.exports = function (req, res, next) {
	if (req.session.uid && req.session.user.username) {
		next();
	} else {
		res.redirect('/login');
	}
}