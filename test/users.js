var User = require('../models/user');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lab');

/*User.newInstance('bob', 'password', function (err, user) {
  if (err) return console.log(err);
  if (user) {
    var temp = user.experiments.create({
      name: 'test1',
      settings: {
        rate: 1,
        email: '',
        phone: 0
      },
      bounds: null,
      path: ''
    });
    user.experiments.push(temp);
    user.save(function (err, prod, num) {
      if (err) return console.log(prod);
      console.log(prod);
    });
  }
});*/

User.findOne({ username: 'bob' }, function (err, user) {
  if (err || !user) return console.log(err);
  var doc = user.experiments.id('52c0ddde33fbaa3987000004');
  doc['path'] = 'blahblah';
  user.save(function (err, prod, num) {
    if (err) return console.log(err);
    console.log(prod);
  });
})