$(document).ready(function(){
  var socket = io.connect('http://localhost:8080');
  var nickname;

  socket.on('connect', function(data) {
    $('#status').html('Connected to chattr');
    nickname = prompt("What is your nickname?");
    socket.emit('join', nickname);
  });

  var field = $("#field");
  var sendButton = $("#send");
  var content = $("#content");
  var chatters = $("#chatters");

  socket.on('add chatter', function(name) {
    // var chatter = $('<li>'+name+'</li>').data('name', name);
    var chatter = $('<li>'+name+'</li>').attr('data-name', name);
    chatters.append(chatter);
  });

  socket.on('existed nickname', function(name) {
    nickname = prompt("Nick name exists, please choose another one: ");
    socket.emit('join', nickname);
  });

  socket.on('remove chatter', function(name) {
    $('#chatters li[data-name=' + name + ']').remove();
  });

  socket.on('messages', function(data) {
    var message = '<li>' + data + '</li>';
    content.append(message);
  });

  field.keyup(function(e) {
    if(e.keyCode == 13) {
      sendMessage();
    }
  });

  sendButton.click(function() {
    sendMessage();
  });

  function sendMessage(){
    var message = field.val();
    field.val("");
    content.append('<li>' + nickname + ": " + message + '</li>');
    socket.emit('messages', message);
  }
});