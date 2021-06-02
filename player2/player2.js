'use strict';

const io = require('socket.io-client');

const host = 'http://localhost:3000';

const connectionToGame = io.connect(host);

// connectionToGame.on('p2',player2Hnadler);

// function player2Hnadler(payload){
//     console.log('i am player 2',payload);
// }



