var User = require('../models/user'),
    fs = require('fs');

exports.read = function (req, res, next) {
  var id = req.params.id,
      uid = req.session.uid;
  User.findById(uid, function (err, user) {
    if (err || !user) return next(err);
    var exp = user.experiments.id(id);
    if (exp) return res.send(200, exp);
    res.send(404, 'Experiment not found');
  });
};

exports.readAll = function (req, res) {
  var uid = req.session.uid;
  User.findOne(uid, function (err, user) {
    if (err || !user) return next(err);
    res.send(200, user.experiments);
  });
};

exports.create = function (req, res) {
  var exp = req.body,
      uid = req.session.uid;
  console.log(exp);
  User.findOne({_id: uid, 'experiments.name': exp.name}, function (err, user) {
    if (err) return next(err);
    if (user) return res.send(400, 'Experiment name already taken');
    exp.path = __dirname + '/../experiment-files/' + user.username + '/' +
      exp.name;
    user.experiments.push(exp);
    user.save(function (err, prod, num) {
      if (err) return next(err);
      res.send(200, prod.experiments[prod.experiments.length-1]);
    });
  });
};

exports.update = function (req, res) {
  var id = req.params.id,
      exp = req.body,
      uid = req.session.uid;
  delete exp._id;
  delete exp.__v;
  User.findById(uid, function (err, user) {
    if (err || !user) return next(err);
    var doc = user.experiments.id(id);
    if (!doc) return res.send(404, 'Experiment not found');
    for (var key in exp) {
      doc[key] = exp[key];
    }
    user.save(function (err, prod, num) {
      if (err) return next(err);
      res.send(200, prod.experiments.id(id));
    });
  });
};

exports.delete = function (req, res) {
  var id = req.params.id,
      uid = req.session.uid;
  User.findById(uid, function (err, user) {
    if (err || !user) return next(err);
    var doc = user.experiments.id(id);
    if (!doc) return res.send(404, 'Experiment not found');
    doc = doc.remove();
    user.save(function (err, prod, num) {
      if (err) return next(err);
      res.send(200, doc);
    });
  });
};

exports.download = function (req, res) {
  var id = req.params.id,
      uid = req.session.uid;
  User.findById(uid, function (err, user) {
    if (err || !user) return next(err);
    var doc = user.experiments.id(id);
    if (!doc) return res.send(404, 'Experiment not found');
    res.download(doc.path);
  });
}