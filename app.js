'use strict';
// Imports
var models   = require('./models/message');
var userM   = require('./models/user');
var like   = require('./models/like');
var asyncLib = require('async');
const  mongoose = require('mongoose');
var jwtUtils = require('./utils/jwt.utils');
// import Module
const express = require('express')
const app = express()

const TITLE_LIMIT   = 0;
const CONTENT_LIMIT = 0;
mongoose.connect('mongodb://localhost:27017/mez', {useNewUrlParser: true},()=>
console.log('connected to db ilyes!'));
//set the template engine ejs
app.set('view engine', 'ejs')

//middlewares
app.use(express.static('public'))


//routes
app.get('/', (req, res) => {
	res.render('index')
})

//Listen on port 3000
const server = app.listen(3007)

//socket.io instantiation
const io = require("socket.io")(server)

//listen on every connection
io.on('connection', (socket, so) => {
	console.log('New user connected')

	//default username
	socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
			 //joining
      socket.join(data.room);

      console.log(data.user + 'joined the room : ' + data.room);

      socket.broadcast.to(data.room).emit('new user joined', {user:data.user, message:'has joined this room.'});
	  socket.username = data.user
	  socket.room = data.room
    })
    socket.on('leave', function(data){
    
      console.log(data.user + 'left the room : ' + data.room);

      socket.broadcast.to(data.room).emit('left room', {user:data.user, message:'has left this room.'});

      socket.leave(data.room);
    })

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
    var headerAuth  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZWMxNWVlZGY0NTYxYzJmZmMzOGQxMjciLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNTg5OTI5NTI5LCJleHAiOjE1ODk5MzMxMjl9.C5VXIMZLxWva9VZ8ks0TPoIdAlA2PjpU7jNJ1j1tMuY";
    var userId      = jwtUtils.getUserId(headerAuth);

    // Params
   
    var title   = data.user;
    var content = data.message;
    console.log(data.user)
    console.log(userId)
    if (title == null || content == null) {
      io.in(socket.room).emit('erreur_message', {erreur : 'missing parameters'});
    } else {
    asyncLib.waterfall([
      function(done) {
        userM.findOne(
         {_id: userId})
        .then(function(userFound) {
          console.log(userFound);
          done(null, userFound);
          console.log("hello word");
          console.log(userFound.id);
        })
        .catch(function(err) {
          io.in(socket.room).emit('erreur_message', {erreur : 'unable to verify user'});
        });
      },
      function(userFound, done) {
        if(userFound) {
          models.create({
            title  : title,
            content: content,
            likes  : 0,
            UserId : userFound.id
          })
          .then(function(newMessage) {
            console.log(newMessage);
            done(newMessage);
          });
        } else {
          io.in(socket.room).emit('erreur_message', {erreur : 'user not found'});
        }
      },
    ], function(newMessage) {
      if (newMessage) {
        console.log(newMessage);
        io.in(socket.room).emit('new_message', {message : data.message, username : socket.username});
        return newMessage;
      } else { 
        io.in(socket.room).emit('erreur_message', {erreur : 'cannot post message'});
      }
    });
       // io.in(socket.room).emit('new_message', {message : data.message, username : socket.username});
    }  // io.sockets.emit('new_message', {message : data.message, username : socket.username});
    })
    socket.on('message',function(data){
      console.log(data.room)
            io.in(data.room).emit('new message', {user:data.user, message:data.message, room: data.room});
          })
        socket.on('post',function(data){
      console.log(data.room)
            io.in(data.room).emit('new post', {user:data.user, message:data.message});
          })
    //listen on typing
    socket.on('typing', (data) => {
    	socket.in(socket.room).emit('typing', {username : socket.username})
    })
})