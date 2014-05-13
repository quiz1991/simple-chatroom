var express = require('express');
var app = express();
var port = 8080; 

app.set('views', __dirname + '/templates');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));
app.get("/", function(req, res){
  res.render("page");
});

var io = require('socket.io').listen(app.listen(port));
// var redis = require('redis')
// var redisClient = redis.createClient();

// var storeMessage = function(name, data){
// 	var message = JSON.stringify({name: name, data: data});
//  	redisClient.lpush("messages", message, function(err, response) {
//    redisClient.ltrim("messages", 0, 10);
// 	}); 
// }

io.sockets.on('connection', function(socket){
  socket.emit('message', { message: 'Welcome to the chatroom!' });
  socket.on('send', function(data){
    io.sockets.emit('message', data);
  });
});

console.log("listening on port 8080");