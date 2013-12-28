module.exports = function (needUid) {
  return function (req, res, next) {
  	if (needUid) {
      if (req.session.uid) next();
      else res.redirect('/login');
    } else {
      if (req.session.uid) res.redirect('/');
      else next();
    }
  };
};