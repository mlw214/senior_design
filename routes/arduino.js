var arduino = require('../lib/arduino');

exports.relay = function (req, res) {
  arduino.toggleRelay();
  res.send();
};

exports.solenoid = function (req, res) {
  arduino.toggleSolenoid();
  res.send();
};