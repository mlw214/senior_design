var spawn = require('child_process').spawn,
    arduino = {},
    fs = require('fs'),
    alertRoom = 'alert';



arduino.initialize = function (io) {
  var self = this;
  this.io = io;
  this.locked = false;
  this.indexConnections = {};
  this.otherConnections = {};
  // Namespace socket connections to simplify logic.
  // One for Index page, the other for the rest of the website.

  // On index namespace connections.
  this.io.of('/da').on('connection', function (socket) {
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
    socket.emit('status', (self.experiment ? true : false));
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
  this.process = spawn(__dirname + '/c++/arduino');
  this.process.stdout.on('data', function (data) {
    var values = data.toString().trim().split(' ');
    self.io.of('/da').emit('data', { 
      liquid: values[0],
      gas: values[1]
    });
    if (self.experiment) {
      self.stream.write('liquid:' + values[0] + ',gas:' + values[1] + '\n');
      // Check bounds.

    }
  });
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
  this.io.of('/da').emit('status', false);
  this.io.of('/a').emit('status', false);
  return this;
};

module.exports = arduino;