const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io'); 
const io = new Server(server)

const {v4: uuidV4} = require('uuid');
require('dotenv').config()

console.log(process.env.ROOM_ID);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    console.log(`room ${req.params.room} created`)
    res.render('home', {roomId: req.params.room, userId: '0101'})
})

io.on('connection', socket => {
    console.log('A user connected');

    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId)
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId);
        
        socket.on('disconnect', ()=>{
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
        })
    });

});

server.listen(3000, ()=>{
    console.log('Server listening...');
});