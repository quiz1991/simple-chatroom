var express = require('express');
var app = express(); 

app.get("/", function(req, res){
	res.send("It works");
});

app.listen(8080);
console.log("listening on port 8080");