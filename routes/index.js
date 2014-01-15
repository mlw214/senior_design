var arduino = require('../lib/arduino');

exports.index = function(req, res){
  res.render('index', {
    title: 'Experiment',
    company: 'Aperture-Mesa 2014'
  });
};