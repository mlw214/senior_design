module.exports = function (needUid) {
  return function (req, res, next) {
  	if (needUid) {
      if (req.session.uid) next();
      else {
      	if (req.xhr) res.send(401, 'You need to be logged in');
      	else res.redirect('/login');
      }
    } else {
      if (req.session.uid) res.redirect('/');
      else next();
    }
  };
};