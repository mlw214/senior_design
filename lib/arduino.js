var Event = require('events').EventEmitter;
var util = require('util');

var emitter;

function ArduinoInterface() {
  Event.call(this);
  this.sensors = {};
  this.sensors.count = 0;
}

util.inherits(ArduinoInterface, Event);

//Need read and write functions.