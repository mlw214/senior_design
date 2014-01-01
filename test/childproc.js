var spawn = require('child_process').spawn,
    arduino = spawn(__dirname + '/../lib/c++/arduino');

arduino.stdout.on('data', function (data) {
  console.log(data.toString());
});