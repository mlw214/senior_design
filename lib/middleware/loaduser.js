var User = require('../../models/user');

module.exports = function () {
  return function (req, res, next) {
    var uid = req.session.uid;
    if (!uid) return next();
    User.findById(uid, function (err, doc) {
      if (err) return next(err);
      req.user = res.locals.user = doc;
      next();
    });
  };
};