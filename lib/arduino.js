var spawn = require('child_process').spawn,
    arduino = {},
    fs = require('fs');


arduino.initialize = function (io) {
  var self = this;
  this.io = io;
  this.locked = false;
  // Configure listeners
  this.io.on('connection', function (socket) {
    socket.on('subscribe', function (room) {
      socket.join(room);
    });
    socket.emit('status', (self.experiment ? true : false));
  });
};

arduino.start = function () {
  var self = this;
  this.process = spawn(__dirname + '/c++/arduino');
  this.process.stdout.on('data', function (data) {
    var values = data.toString().trim().split(' ');
    self.io.sockets.in('data').emit('data', { 
      liquid: values[0],
      gas: values[1]
    });
    if (self.experiment) {
      self.stream.write('liquid:' + values[0] + ',gas:' + values[1] + '\n');
      // Check bounds
    }
  });
  return this;
};

arduino.lock = function () {
  this.locked = true;
};

arduino.unlock = function () {
  this.locked = false;
  this.uid = null;
};

arduino.setExperiment = function (experiment, user) {
  var self = this;
  this.stream = fs.createWriteStream(experiment.path, { mode: 0655 });
  this.stream.on('open', function (fd) {
    console.log('Stream open!');
    self.experiment = experiment;
    self.io.sockets.emit('status', true);
  });
  return this;
};

arduino.updateExperiment = function (experiment, user) {
  this.experiment = experiment;
  return this;
}

arduino.clearExperiment = function () {
  this.stream.end();
  this.experiment = null;
  this.io.sockets.emit('status', false);
  return this;
};

module.exports = arduino;