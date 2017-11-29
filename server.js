var express = require('express');
var path= require('path');
var app = express();

var server =  require('http').Server(app);
var io = require('socket.io')(server);
var port = 8256;

var users=[];

app.use(express.static(path.join(__dirname,"public")));
app.use('/scripts', express.static(path.join(__dirname, 'node_modules')));



io.on('connection',function(socket){

    console.log("new connection");

    // socket.emit('message-from-server',{
    //     greeting:"Hello from server"
    // });


    // socket.on('message-from-client',function(msg){
    //     console.log(msg);
    // });


    socket.on('get-users',function(){
        socket.emit('all-users',users);
    })

    socket.on('join',function(data){
        console.log(data);
        console.log(users);
        socket.nickname=data.nickname;
        users[socket.nickname]=socket;

        var userObj={
            nickname:data.nickname,
            socketid:socket.id
        };

        users.push(userObj);
        io.emit('all-users',users);
    });


    socket.on('send-message',function(data){
        //socket.broadcast.emit('message-recieved',data);
        io.emit('message-recieved',data);
    });

    socket.on('send-like',function(data){
        console.log(data);
        
        socket.broadcast.to(data.like).emit('user-liked',data);
    });

    socket.on('disconnect',function(data){
       
        users=users.filter(function(item){
            return item.nickname!==socket.nickname;
        });

        io.emit('all-users',users);

    });

    socket.on('join-private',function(data){
        //console.log(data);
        
        socket.join('private');

        console.log(data.nickname+ "joined private");
    });

    socket.on('private-chat',function(data){
        //console.log(data);
        
        socket.broadcast.to('private').emit('show-message',data.message);
        
    });

    

});



server.listen(port,function(){

    console.log("listening on port "  + port);
});

