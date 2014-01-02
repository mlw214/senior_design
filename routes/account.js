var User = require('../models/user');
var bcrypt = require('bcrypt');

exports.edit = function (req, res) {
  res.render('account', {
    title: 'Account Info',
    username: req.session.username,
    carriers: [
      { name: 'AT&T', ext: 'blah'},
      { name: 'Verizon', ext: 'blah' },
      { name: 'T-Mobile', ext: 'blah' },
      { name: 'Sprint', ext: 'blah' }
    ],
    company: 'Aperture-Mesa 2014'
  });
};

exports.changeUsername = function (req, res, next) {
  var data = req.body.user;
  User.findById(req.session.uid, function (err, user) {
    if (user) {
      bcrypt.compare(data.pass, user.password, function (err, ok) {
        if (err) return next(err);
        if (ok) {
          User.findOne({ username: data.newName }, function (err, exists) {
            if (err) return next(err);
            if (exists) {
              if (user.username === exists.username)
                return res.send(400, 'You\'re using that username');
              return res.send(400, 'Username already in use');
            }
            user.username = data.newName;
            user.save(function (err, prod, num) {
              if (err) return next(err);
              req.session.username = user.username;
              res.send(200, user.username);
            });
          });
        } else {
          res.send(401, 'Invalid password');
        }
      });
    } else {
      res.send(500, 'Internal server error');
    }
  });
};

exports.changePassword = function (req, res, next) {
  var data = req.body.user;
  User.findById(req.session.uid, function (err, user) {
    if (err) return next(err);
    if (user) {
      bcrypt.compare(data.pass, user.password, function (err, ok) {
        if (err) return next(err);
        if (ok) {
          if (data.newPass !== data.newConfirm)
            return res.send(400, 'New passwords must match')
          if (data.newPass.length < 8)
            return res.send(400, 
              'Passwords must be at least 8 characters long'
            );
          bcrypt.genSalt(12, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(data.newPass, salt, function (err, hash) {
              if (err) return next(err);
              user.password = hash;
              user.save(function (err, prod, num) {
                if (err) return next(err);
                res.send(200);
              });
            });
          });
        } else {
          res.send(401, 'Invalid password');
        }
      });
    } else {
      res.send(500, 'Internal server error');
    }
  })
};

exports.updateContactInfo = function (req, res, next) {
  var data = req.body.user;
  User.findById(req.session.uid, function (err, user) {
    if (err) return next(err);
    if (user) {
      user.contact = {
        email: data.email,
        cellphone: data.cell,
        carrier: (data.cell ? data.carrier : '')
      };
      user.save(function (err, prod, num) {
        if (err) return next(err);
        res.send(200, user.contact);
      });
    } else {
      res.send(500, 'Internal server error');
    }
  });
};

exports.deleteAccount = function (req, res, next) {

}