exports.page = function (req, res) {
  res.render('device', {
  	title: 'Device Settings',
  	company: 'Aperture-Mesa 2013'
  });
}