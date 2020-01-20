var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var socketID = undefined;

app.get('/lowfuel', (req,res,next) => {
    io.to(socketID).emit('lowFuelEvent');
    res.status(200).end();
})

io.on('connection', function(socket){
  console.log('a user connected');

  socketID = socket.id;
  socket.on('disconnect', function(opt, cb) {
    console.log("Socket disconnected");
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});