
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
  	title: 'Experiment',
  	company: 'Aperture-Mesa 2014'
  });
};