$(document).ready(function(){
  var messages = [];
  var socket = io.connect('http://localhost:8080');

  var field = $("#field");
  var sendButton = $("#send");
  var content = $("#content");
  var name = $("#name");

  socket.on("message", function(data){
    if(data.message){
      messages.push(data);
      var html = '';
      for(var i = 0; i < messages.length; i++){
        html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
        html += messages[i].message + '<br />';
      }
      content.html(html);
      content.scrollTop(content[0].scrollHeight);      
    }else{
      console.log("There is a problem:", data);
    }
  });

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
      socket.emit('send', { message: text, username: name.val() });
      field.html("");
    }
  }
});