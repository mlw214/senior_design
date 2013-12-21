exports.notEmpty = function (req, res, next) {
	var val = req.body;
	console.log(val);
	next();
};