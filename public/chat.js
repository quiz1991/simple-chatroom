$(document).ready(function(){
  var messages = [];
  var socket = io.connect('http://localhost:8080');

  socket.on('connect', function(data) {
    $('#status').html('Connected to chattr');
    nickname = prompt("What is your nickname?");
    socket.emit('join', nickname);
  });

  var field = $("#field");
  var sendButton = $("#send");
  var content = $("#content");
  var name = $("#name");
  var chatters = $("#chatters");

  socket.on('add chatter', insertChatter);
  var insertChatter = function(name) {
    alert(' is added!');
    // var chatter = $('<li>'+name+'</li>').data('name', name);
    // chatters.append(chatter);
  }

  socket.on('remove chatter', removeChatter);
  var removeChatter = function(name) {
    $('#chatters li[data-name=' + name + ']').remove();
  }

  socket.on('messages', insertMessage);
  var insertMessage = function(data) {
    var message = '<li>' + data + '</li>';
    content.append(message);
  }

  // socket.on("message", function(data){
  //   if(data.message){
  //     messages.push(data);
  //     var html = '';
  //     for(var i = 0; i < messages.length; i++){
  //       html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
  //       html += messages[i].message + '<br />';
  //     }
  //     content.html(html);
  //     content.scrollTop(content[0].scrollHeight);      
  //   }else{
  //     console.log("There is a problem:", data);
  //   }
  // });

  field.keyup(function(e) {
    if(e.keyCode == 13) {
      sendMessage();
    }
  });

  sendButton.click(function(){
    sendMessage();
  });

  sendMessage = function(){
    if(name.val() == ""){
      alert("Please type your name!");
    }else{
      var text = field.val();
      socket.emit('messages', message);
      field.html("");
    }
  }
});