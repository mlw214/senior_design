var index = (function () {
    var socket = io.connect('http://localhost:3000');
    socket.on('connect', function () {
        socket.emit('subscribe', 'data');
    });
    socket.on('data', function (data) {
        $('#liquid').html(data.sensor1);
        $('#gas').html(data.sensor2);
    });
    return {
        socket: socket
    };
}());