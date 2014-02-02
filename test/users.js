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

User.findOne({ username: 'mlw214' }, function (err, user) {
  if (err) return console.log(err);
  /*var exp = {
    name: 'test3',
    description: 'This is a test',
    cancelled: false,
    rate: 1,
    contact: 'none',
    camera: {
      used: true,
      bound: 'Red',
      auto: false
    },
    sensors: [{
      type: 'Gas',
      used: true,
      lower: 55,
      upper: 555,
      auto: false
    }, {
      type: 'Liquid',
      used: true,
      lower: 55,
      upper: 555,
      auto: false
    }],
    path: '/Users/millerwilt'
  };
  user.experiments.push(exp);
  user.save(function (err, prod, num) {
    if (err) return console.log(err);
    var exp = prod.experiments[prod.experiments.length-1];
    console.log(exp);
  });*/
  console.log(JSON.stringify(user.experiments[0]));
});