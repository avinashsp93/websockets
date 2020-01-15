var express = require('express');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('app'));
app.use('/bower_components', express.static('bower_components'));


let messages = [
    {
        userId: 1,
        messageId: 10,
        userName: "Asha Greyjoy",
        content: {
            text: "The stone tree of the Stonetrees.",
            link: "https://iceandfire.fandom.com/wiki/House_Stonetree"
        },
        likedBy: [1],
        ts: Date.now() - 100000
    }, {
        userId: 2,
        messageId: 11,
        userName: "Arya Stark",
        content: {
            text: "We'll come see this inn.",
            link: "https://gameofthrones.fandom.com/wiki/House_Stark"
        },
        likedBy: [2,3],
        ts: Date.now() - 100000
    }, {
        userId: 3,
        messageId: 14,
        userName: "Cersei Lannister",
        content: {
            text: "Her scheming forced this on me.",
            link: "https://awoiaf.westeros.org/index.php/House_Tyrell"
        },
        likedBy: [],
        ts: Date.now() - 100000
    }
]

io.on('connection', function(socket) {
    console.log('User connected to socket.io');
    socket.emit("messages", messages);
    socket.on("new-message", function(data) {
        messages.push(data);
        io.sockets.emit("messages", messages);
    });
    socket.on("update-message", function(data) {
        var message = messages.filter(function(message) {
            return message.messageId == data.messageId;
        })[0];
        message.likedBy = data.likedBy;
        io.sockets.emit("messages", messages);
    });

    socket.on('disconnect', function() {
        io.emit("User disconnected");
    });
});


server.listen(3000);