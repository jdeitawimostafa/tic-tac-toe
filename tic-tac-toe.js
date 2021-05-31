'use strict';

const PORT = process.env.PORT || 4000;

const io = require('socket.io')(PORT);


io.on('connection',(socket) => {
    console.log('we are connected to the game !');

    // socket.on('player1',(payload) => {
    //     console.log('i am player 1 ');
    //     io.emit('p1',payload);
    // })

    // socket.on('player2',(payload) => {
    //     console.log('i am player 2');
    //     io.emit('p2',payload);
    // })
})
