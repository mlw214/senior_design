var User = require('../models/user');
var bcrypt = require('bcrypt');

exports.edit = function (req, res) {
  res.render('account', {
    title: 'Account Info',
    company: 'Aperture-Mesa 2013'
  });
};

exports.changeUsername = function (req, res) {
  var data = req.body.user;
  User.findById(req.session.uid, function (err, user) {
    if (user) {
      bcrypt.compare(data.pass, user.password, function (err, ok) {
        if (err) return res.send(500, 'Internal server error!');
        if (ok) {
          User.findOne({ username: data.name }, function (err, exists) {
            if (err) return res.send(500, 'Internal server error!');
            if (exists) {
              if (user.username === exists.username)
                return res.send(403, 'You\'re using that username!');
              return res.send(403, 'Username already in use!');
            }
            user.username = data.user;
            user.save(function (err, prod, num) {
              if (err) return res.send(500, 'Internal server error!');
            });
            res.send(200);
          });
        } else {
          res.send(401, 'Invalid password!');
        }
      });
    } else {
      res.send(500, 'Internal server error!');
    }
  });
};

exports.changePassword = function (req, res) {
  var data = req.body.user;
  User.findById(req.session.uid, function (err, user) {
    if (user) {
      bcrypt.compare(data.pass, user.password, function (err, ok) {
        if (err) return res.send(500, 'Internal server error');
        if (ok) {
          if (data.newpass !== data.confirm)
            return res.send(403, 'New passwords must match!')
          if (data.newpass.length < 8 || data.newpass.length > 50)
            return res.send(403, 
              'Passwords must between 8 and 50 characters long!'
            );
          bcrypt.genSalt(12, function (err, salt) {
            if (err) return res.send(500, 'Internal server error!');
            bcrypt.hash(data.newpass, salt, function (err, hash) {
              if (err) return res.send(500, 'Internal server error!');
              user.password = hash;
              user.save(function (err, prod, num) {
                if (err) return res.send(500, 'Internal server error!');
                res.send(200);
              });
            });
          });
        } else {
          res.send(401, 'Invalid password!');
        }
      });
    } else {
      res.send(500, 'Internal server error!');
    }
  })
};