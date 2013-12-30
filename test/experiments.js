var Experiment = require('../models/experiment');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lab');

var test = new Experiment({
  name: 'test2',
  settings: {
    rate: 1,
    email: '',
    phone: 0
  },
  bounds: null,
  path: '/Users/millerwilt/test.txt'
});


test.save(function (err, prod, num) {
  if (err) console.log(err);
  else console.log(prod.id);
});

/*Experiment.findOne({ name: 'test' }, function (err, prod) {
  if (err) return console.log(err);
  console.log(prod.id);
})*/