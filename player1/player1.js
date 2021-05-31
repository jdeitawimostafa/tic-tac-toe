'use strict';

const io = require('socket.io-client');

const host = 'http://localhost:3000';

const connectionToGame = io.connect(host);

// connectionToGame.on('p1',player1Hnadler);

// function player1Hnadler(payload){
//     console.log('i am player 1',payload);
// }

