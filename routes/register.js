var User = require('../models/user');
var fs = require('fs');

exports.form = function (req, res) {
  res.render('register', { 
  	title: 'Register',
  	minlen: 8,
  	company: 'Aperture-Mesa 2014'
  });
};

exports.submit = function (req, res, next) {
  var data = req.body.user;
  User.newInstance(data.name, data.pass, function (err, user) {
    if (err) return next(err);
    user.save(function (err, prod, num) {
      if (err) return next(err);
      res.send();
    });
  });
};