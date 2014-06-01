var express = require('express');
var app = express();
var port = 8080; 

//express settings
app.set('views', __dirname + '/templates');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));
app.get("/", function(req, res){
  res.render("page");
});

var io = require('socket.io').listen(app.listen(port));

// import redis database to store chatters and messages
var redis = require('redis')
var redisClient = redis.createClient();

// store messages in redis
var storeMessage = function(name, data){
	var message = JSON.stringify({name: name, data: data});
 	redisClient.lpush("messages", message, function(err, response) {
   redisClient.ltrim("messages", 0, 10);
	}); 
}

// check if nickname exists with redis database query
var checkNick = function(socket, name, callback) {
  var existance = 0;
  var newNick = name;
  redisClient.smembers('chatters', function(err, names) {
    names.forEach(function(name){
      if(name === newNick) {
        existance = 1;

        // if nickname exists, ask chatter to reinput another one
        socket.emit("existed nickname", name);
      }
    });
    if(existance == 0)
      callback(name);
  });
}

io.sockets.on('connection', function(socket) {
  console.log('Client connected...');

  socket.on('join', function(name) {
    checkNick(socket, name, function(name) {
      // broadcast a new chatter to other chatters
    	socket.broadcast.emit("add chatter", name);

      // list all existing chatters for the new chatter
    	redisClient.smembers('chatters', function(err, names) {
  	    names.forEach(function(name){
  	      socket.emit('add chatter', name);
  			});
  		}); 

      // add the new chatter to redis database
    	redisClient.sadd("chatters", name);

      // list all existing messages for the new chatter
    	redisClient.lrange("messages", 0, -1, function(err, messages){
    		messages = messages.reverse();
    		messages.forEach(function(message){
    			message = JSON.parse(message);
    			socket.emit("messages", message.name + ": " + message.data);
    		});
  		});

      // bound the nickname to the socket
      socket.set('nickname', name);
    });
  });

  socket.on('messages', function(message) {
    socket.get('nickname', function(err, name){
      // store the new coming message
    	storeMessage(name, message);

      // boardcast the message to chatters other than the sender
    	socket.broadcast.emit("messages", name + ": " + message);
    });
	});

  socket.on('disconnect', function(){
	  socket.get('nickname', function(err, name){
      // remove the disconnected chatter from redis database
      redisClient.srem("chatters", name);

      // boardcast the disconnected chatter to other chatters
	    socket.broadcast.emit("remove chatter", name);
	  });
	});
});