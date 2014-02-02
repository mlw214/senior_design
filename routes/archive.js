exports.page = function (req, res) {
  console.log(req.session);
  res.render('archive', {
  	title: 'Experiment Archive',
  	company: 'Aperture-Mesa 2014'
  });
}