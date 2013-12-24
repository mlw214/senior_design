module.exports = function () {
  return function (req, res, next) {
    if (req.session.uid) {
      next();
    } else {
      res.redirect('/login');
    }
  };
};