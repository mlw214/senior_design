var spawn = require('child_process').spawn,
    arduino = spawn(__dirname + '/../lib/python/arduino.py');

function getData() {
  arduino.stdin.write('d\n');
}

setInterval(getData, 1000);

arduino.stdout.on('data', function (data) {
  console.log(data.toString());
});