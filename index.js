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
var redis = require('redis')
var redisClient = redis.createClient();

var storeMessage = function(name, data){
	var message = JSON.stringify({name: name, data: data});
 	redisClient.lpush("messages", message, function(err, response) {
   redisClient.ltrim("messages", 0, 10);
	}); 
}

io.sockets.on('connection', function(socket) {
  console.log('Client connected...');

  socket.on('join', function(name) {
  	socket.broadcast.emit("add chatter", name);
  	redisClient.smembers('chatters', function(err, names) {
	    names.forEach(function(name){
	      socket.emit('add chatter', name);
			});
		}); 
  	redisClient.sadd("chatters", name);

  	redisClient.lrange("messages", 0, -1, function(err, messages){
  		messages = messages.reverse();
  		messages.forEach(function(message){
  			message = JSON.parse(message);
  			socket.emit("messages", message.name + ": " + message.data);
  		});
		});

    socket.set('nickname', name);
  });

  socket.on('messages', function(message) {
    socket.get('nickname', function(err, name){
    	storeMessage(name, message);
    	socket.broadcast.emit("messages", name + ": " + message);
    });
	});

  socket.on('disconnect', function(){
	  socket.get('nickname', function(err, name){
	    socket.broadcast.emit("remove chatter", name);
	    redisClient.srem("chatters", name);
	  });
	});
});