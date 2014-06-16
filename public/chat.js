$(document).ready(function(){
  var socket = io.connect('http://localhost:8080');
  var nickname;

  socket.on('connect', function(data) {
    $('#status').html('Welcome to the chatroom!!!');
    nickname = prompt("What is your nickname?");
    socket.emit('join', nickname);
  });

  var chatters = $("#chatters");
  var content = $("#content");
  var field = $("#controlls-field");
  var sendButton = $("#controlls-send");

  socket.on('add chatter', function(name) {
    var chatter = $('<li>'+name+'</li>').attr('data-name', name);
    chatters.append(chatter);
  });

  socket.on('existed nickname', function(name) {
    nickname = prompt(name + " is already being used, please choose another one: ");
    socket.emit('join', nickname);
  });

  socket.on('remove chatter', function(name) {
    $('#chatters li[data-name=' + name + ']').remove();
  });

  socket.on('messages', function(message) {
    if(message.name === nickname)
      content.append("<li class='floatRight message'>" + message.data + "</li>");
    else
      content.append("<li class='floatLeft'>" + message.name + ": " + "<div class='left-triangle'></div><div class='message'>" + message.data + "</div>" + "</li>");

    // set the scroll bar to the newest message
    content.scrollTop(content[0].scrollHeight);
  });

  field.keyup(function(e) {
    // send message if chatter press the "enter" button
    if(e.keyCode == 13) {
      sendMessage();
    }
  });

  sendButton.click(function() {
    sendMessage();
  });

  function sendMessage(){
    var message = field.val();

    // clean the message input area after sent
    field.val("");
    content.append("<li class='floatRight message'>" + message + "</li>");
    content.scrollTop(content[0].scrollHeight);
    socket.emit('messages', message);
  }
});