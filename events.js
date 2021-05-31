'use strict';

const io = require('socket.io-client');

const host = 'http://localhost:3000';

const connectionToGame = io.connect(host);


// connectionToGame.emit('connection',console.log('the events triggred !!'));
// connectionToGame.emit('player1',{name:'tamara'});
// connectionToGame.emit('player2',{name:'anwar'});