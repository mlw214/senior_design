var User = require('../models/user');

exports.form = function (req, res) {
  res.render('login', { title: 'Login' });
};

exports.submit = function (req, res, next) {
  var data = req.body.user;
  User.authenticate(data.name, data.pass, function (err, user) {
    if (err) return next(err);
    if (user) {
      req.session.uid = user.id;
      req.session.username = user.username;
      res.redirect('/');
    } else {
      res.error('Invalid username or password');
      res.redirect('back');
    }
  });
};

exports.logout = function (req, res) {
  req.session.destroy(function (err) {
    if (err) throw err;
    res.redirect('/login');
  });
};