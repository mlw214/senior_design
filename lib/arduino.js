var spawn = require('child_process').spawn,
    EventEmitter = require('events').EventEmitter,
    arduino = new EventEmitter(),
    fs = require('fs'),
    alertRoom = 'alert';

function queryData() {
  arduino.process.stdin.write('d\n');
}

arduino.initialize = function (io) {
  var self = this;
  this.io = io;
  this.locked = false;
  this.indexConnections = {};
  this.otherConnections = {};
  this.relay = false;
  this.solenoid = false;
  this.rate = 1;
  // Namespace socket connections to simplify logic.
  // One for Index page, the other for the rest of the website.

  // On index namespace connections.
  this.io.of('/da').on('connection', function (socket) {
    var status = {
      relay: self.relay,
      solenoid: self.solenoid
    };
    if (!self.indexConnections[socket.handshake.uid]) {
      self.indexConnections[socket.handshake.uid] = [socket.id];
    } else {
      self.indexConnections[socket.handshake.uid].push(socket.id);
    }
    if (self.experiment &&
        self.user._id.toString() === socket.handshake.uid.toString()) {
      socket.emit('experimentID', self.experiment._id);
      socket.join(alertRoom);
      socket.emit('mode', true);
    } else if (self.experiment) socket.emit('mode', false);

    socket.on('disconnect', function () {
      var ids = self.indexConnections[socket.handshake.uid];
      for (var i = 0; i < ids.length; ++i) {
        if (ids[i] === socket.id) {
          ids.splice(i, 1);
          break;
        }
      }
      if (ids.length === 0) delete self.indexConnections[socket.handshake.uid];
    });
    status['status'] = self.experiment ? true : false;
    socket.emit('status', status);
  });
  // On standard namespace connections.
  this.io.of('/a').on('connection', function (socket) {
    if (!self.otherConnections[socket.handshake.uid]) {
      self.otherConnections[socket.handshake.uid] = [socket.id];
    } else {
      self.otherConnections[socket.handshake.uid].push(socket.id);
    }
    if (self.experiment &&
      self.user._id.toString() === socket.handshake.uid.toString()) {
      socket.join(alertRoom);
    }
    socket.on('disconnect', function () {
      var ids = self.otherConnections[socket.handshake.uid];
      for (var i = 0; i < ids.length; ++i) {
        if (ids[i] === socket.id) {
          ids.splice(i, 1);
          break;
        }
      }
      if (ids.length === 0) delete self.otherConnections[socket.handshake.uid];
    });
    socket.emit('status', (self.experiment ? true : false));
  });
  return this;
};


arduino.start = function () {
  var self = this;
  this.process = spawn(__dirname + '/python/arduino.py');
  this.process.stdout.on('data', function (data) {
    data = data.toString().trim();
    if (data === 'relayOn') {
      self.relay = true;
      self.emit('relay', self.relay);
    } else if (data === 'relayOff') {
      self.relay = false;
      self.emit('relay', self.relay);
    } else if (data === 'solenoidOn') {
      self.solenoid = true;
      self.emit('solenoid', self.solenoid);
    } else if (data === 'solenoidOff') {
      self.solenoid = false;
      self.emit('solenoid', self.solenoid);
    } else {
      var sensors = data.split(';'),
          sensorReadings = {}
      for (var i = 0; i < sensors.length; ++i) {
        var reading = sensors[i].split(':');
        sensorReadings[reading[0]] = reading[1];
      }
      self.io.of('/da').emit('data', sensorReadings);
    }
  });
  setInterval(queryData, this.rate*1000);
  return this;
};

arduino.lock = function () {
  this.locked = true;
  return this;
};

arduino.unlock = function () {
  this.locked = false;
  return this;
};

arduino.setExperiment = function (experiment, user) {
  var self = this;
  this.stream = fs.createWriteStream(experiment.path, { mode: 0655 });
  this.stream.on('open', function (fd) {
    self.experiment = experiment;
    if (self.experiment.rate !== self.rate) {
      clearInterval(queryData);
      self.rate = self.experiment.rate;
      setInterval(queryData, self.rate*1000);
    }
    self.user = user;
    self.indexSocketIDs = self.indexConnections[self.user._id];
    self.indexSocketIDs.forEach(function (socketID) {
      self.io.of('/da').socket(socketID).join(alertRoom);
    });
    self.io.of('/da').emit('status', true);
    self.io.of('/da').in(alertRoom).emit('mode', true);
    self.otherSocketIDs = self.otherConnections[self.user._id];
    if (self.otherSocketIDs) {
      self.otherSocketIDs.forEach(function (socketID) {
        self.io.sockets.socket(socketID).join(alertRoom);
      });
      self.io.of('/a').in(alertRoom).emit('status', true);
    }
  });
  return this;
};

arduino.updateExperiment = function (experiment) {
  this.experiment = experiment;
  if (self.experiment.rate !== self.rate) {
    clearInterval(queryData);
    self.rate = self.experiment.rate;
    setInterval(queryData, self.rate*1000);
  }
  return this;
}

arduino.clearExperiment = function () {
  var self = this;
  this.stream.end();
  this.indexSocketIDs.forEach(function (socketID) {
    self.io.sockets.socket(socketID).leave(alertRoom);
  });
  if (this.otherSocketIDs) {
    this.otherSocketIDs.forEach(function (socketID) {
      self.io.sockets.socket(socketID).leave(alertRoom);
    });
  }
  this.experiment = null;
  this.user = null;
  this.indexSocketIDs = null;
  this.otherSocketIDs = null;
  var status = {
    status: false,
    relay: this.relay,
    solenoid: this.solenoid
  };
  this.io.of('/da').emit('status', status);
  this.io.of('/a').emit('status', status);
  return this;
};

arduino.toggleRelay = function () {
  var self = this;
  this.process.stdin.write('r\n');
  this.once('relay', function (status) {
    this.io.of('/da').emit('status', {
      status: self.experiment ? true : false,
      relay: status,
      solenoid: self.solenoid
    });
  });
};

arduino.toggleSolenoid = function () {
  var self = this;
  this.process.stdin.write('s\n');
  this.once('solenoid', function (status) {
    this.io.of('/da').emit('status', {
      status: self.experiment ? true : false,
      relay: self.relay,
      solenoid: status
    });
  });
};

module.exports = arduino;