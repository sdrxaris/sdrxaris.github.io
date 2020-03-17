var express = require('express');
var app = express();
var serv = require('http').Server(app);
app.get('/', function(req,res)
{
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
serv.listen(2000);
console.log("Server started");

var SOCKET_LIST = {};

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket)
{
	socket.id = Math.random();
	socket.x = Math.floor(800 * Math.random());
	socket.speed = 10;
	socket.y = Math.floor(600 * Math.random())
	socket.name = "" + Math.floor(10 * Math.random());
	SOCKET_LIST[socket.id] = socket;
	console.log('socket connection');
	for (var i in SOCKET_LIST)
	{
		if(i.id != socket.id)
		{
			SOCKET_LIST[i].emit('playerJoined', {x:socket.x, y:socket.y, id:socket.id, name:socket.name});
		}
		socket.emit('playerJoined', {x:SOCKET_LIST[i].x, y:SOCKET_LIST[i].y, id:SOCKET_LIST[i].id, name:SOCKET_LIST[i].name});
	}
	socket.on('movingUp', function (data)
		{
			if(data.status == "true") socket.movingUp = true;
			else if(data.status == "false") socket.movingUp = false;
		});
	socket.on('movingDown', function (data)
		{
			if(data.status == "true") socket.movingDown = true;
			else if(data.status == "false") socket.movingDown = false;
		});
	socket.on('movingLeft', function (data)
		{
			if(data.status == "true") socket.movingLeft = true;
			else if(data.status == "false") socket.movingLeft = false;
		});
	socket.on('movingRight', function (data)
		{
			if(data.status == "true") socket.movingRight = true;
			else if(data.status == "false") socket.movingRight = false;
		});
	socket.on('disconnect', function(){
		delete SOCKET_LIST[socket.id];
		console.log('socket disconnected');
		for (var i in SOCKET_LIST)
		{
			SOCKET_LIST[i].emit('playerLeft', {id:socket.id});
		}
	});
});

setInterval(function(){
	var pack = [];
	for(var i in SOCKET_LIST)
	{
		var socket = SOCKET_LIST[i];
		if(socket.movingUp) socket.y -= socket.speed;
		else if(socket.movingDown) socket.y += socket.speed;
		if(socket.movingRight) socket.x += socket.speed;
		else if(socket.movingLeft) socket.x -= socket.speed;
		pack.push({x:socket.x, y:socket.y, id:socket.id});

	}
	for(var i in SOCKET_LIST)
	{
		SOCKET_LIST[i].emit('newPositions', pack);
	}
}, 1000/25);