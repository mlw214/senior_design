var index = (function () {
    var socket = io.connect('http://localhost:3000');
    socket.on('connect', function () {
        socket.emit('subscribe', 'data');
    });
    socket.on('data', function (data) {
        $('p #sensor1').html(data.sensor1);
        $('p #sensor2').html(data.sensor2);
    });
    return {
        socket: socket
    };
}());