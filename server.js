const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//static folder
app.use(express.static(path.join(__dirname, 'public')));

const serverName = 'Server';

io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //mensaje de bienvenida
        socket.emit('message', formatMessage(serverName, 'Bienvenido al chat'));

        //cuando un usuario se conecta
        socket.broadcast.to(user.room).emit('message', formatMessage(serverName, `${user.username} entro al chat`));

        //enviar info de usuarios y sala
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })

    //cuando un usuario se desconecta
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(serverName, `${user.username} a dejado el chat`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })

})

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => { console.log('listening on port ' + PORT) });