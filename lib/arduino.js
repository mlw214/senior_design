var spawn = require('child_process').spawn,
    arduino;


exports.start = function () {
  arduino = spawn(__dirname + '/c++/arduino');
  return arduino;
};