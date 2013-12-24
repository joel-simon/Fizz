var io = require('socket.io').listen(9002);

io.sockets.on('connection', function (socket) {
  socket.on('foo', function (data) {
    socket.emit('bar', data);
  });
});