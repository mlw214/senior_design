var account = (function () {
    var socket = io.connect('http://localhost:3000/');
    socket.on('connect', function () {
        socket.emit('subscribe', 'alerts');
    });
    return { socket: socket };
}())