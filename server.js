const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io'); 
const io = new Server(server)

const {v4: uuidV4} = require('uuid');
require('dotenv').config()


app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('home', {roomId: req.params.room})
})

io.on('connection', socket => {

    socket.on('join-room', (roomId, userId) => {
        console.log(`Room: ${roomId} \t User: ${userId}`);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        
        socket.on('disconnect', ()=>{
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
        })
    });

});

server.listen(3000, ()=>{
    console.log('Server listening...');
});