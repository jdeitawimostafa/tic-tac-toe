'use strict';

require('dotenv').config();

const express = require('express');

const app = express();

const PORT = process.env.PORT || 4000;

const socketIo = require('socket.io');

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
  
app.get('/waiting', (req, res) => {
  res.sendFile(__dirname + '/public/waiting.html');
});
const server = app.listen(PORT, () => console.log('listening on port ' + PORT));

const Player = require('./Models/player/player.js');
const TicTacToe = require('./Models/game/game.js');


let waitingList = [];
let games = [];
let players = [];

let rooms = 0;

const io = socketIo(server);

let room = io.of('http://localhost:3000/waiting');


io.on('connection', (socket) => {
  const updateGame = (game) => {
    const player1 = players.find((player) => player.playerId === game.player1Id);
    const player2 = players.find((player) => player.playerId === game.player2Id);
    if (game.turn === 0) {
      io.to(`room-${++rooms}`).emit('game-update', {
        game: game.game,
        yourTurn: true,
        otherPlayer: player2.playerName,
      });
      io.to(room).emit('game-update', {
        game: game.game,
        yourTurn: false,
        otherPlayer: player1.playerName,
      });
    } else {
      io.to(room).emit('game-update', {
        game: game.game,
        yourTurn: false,
        otherPlayer: player2.playerName,
      });
      io.to(room).emit('game-update', {
        game: game.game,
        yourTurn: true,
        otherPlayer: player1.playerName,
      });
    }
  };
  socket.on('waiting', ({ data }) => {
    if (waitingList.length > 0) {
      socket.join(`room-${++rooms}`);
      const player2 = new Player(socket.id+1, data.name);
      // socket.broadcast.to(data.room).emit('player1', {});
      // socket.emit('player2', { name: data.name, room: data.room });
      players.push(player2);
      const game = new TicTacToe(players[0].playerId,players[1].playerId);
      console.log('game start');
      console.log(waitingList);
      games.push(game);
      console.log('new game');
      console.log(games);
      
      updateGame(game);
    } else {
      waitingList.push(data.name);
      console.log('new waiting person');
      console.log('aaaaaaaa',waitingList);
    }
    //socket.emit('newGame', { name: playerName, room: `room-${rooms}` });
    
  });
  socket.on('createGame', ({ playerName }) => {
    console.log('createGame playerName',playerName);
    const player = new Player(socket.id, playerName);
    socket.join(room);
    console.log(`room-${++rooms}`);
    players.push(player);
    socket.emit('waiting', { name: playerName, room: `room-${rooms}` });
  });
  
  socket.on('joinGame', function (data) {
    socket.emit('waiting', { name: data.name, room: data.room });
    //.adapter.rooms[data.room];
   

    //console.log('game', game);
    //updateGame(game);
    /* players.push(player);
    if (waitingList.length > 0) {
      const newPlayer = waitingList.shift();
      console.log('game start');
      console.log(waitingList);
      const game = new TicTacToe(player.playerId, newPlayer.playerId);
      games.push(game);
      console.log('new game');
      console.log(games);
      updateGame(game);
    } else {
      waitingList.push(player);
      console.log('new waiting person');
      console.log('aaaaaaaa',waitingList);
    } */
  });
  socket.on('move', ({ move }) => {
    const game = games.find((game) => game.includes(socket.id));
    if (game.yourTurn(socket.id)) {
      console.log(game.makeMove(move));
      updateGame(game);
    } else {
      socket.emit('server-message', {
        message: 'Wait your turn',
      });
    }
    const winner = game.winner();
    if (winner) {
      if (winner === 1) {
        io.to(game.player1Id).emit('game-over', {
          message: 'YOU WIN!',
        });
        io.to(game.player2Id).emit('game-over', {
          message: 'YOU LOSE :(',
        });
      } else if (winner === 2) {
        io.to(game.player2Id).emit('game-over', {
          message: 'YOU WIN!',
        });
        io.to(game.player1Id).emit('game-over', {
          message: 'YOU LOSE :(',
        });
      } else {
        io.to(game.player1Id).to(game.player2Id).emit('game-over', {
          message: 'SCRATCH, you\'re both losers',
        });
      }
    }
  });

  socket.on('disconnect', () => {
    const game = games.find((game) => game.includes(socket.id));
    const find = waitingList.find((player) => player.id === socket.id);
    players = players.filter((player) => player.id !== socket.id);
    if (find) {
      waitingList = waitingList.filter((player) => player.id !== socket.id);
      console.log('left waiting area');
      console.log(waitingList);
    }
    if (game) {
      games = games.filter((g) => g.gameId !== game.gameId);
      console.log('game over');
      console.log(games);
      io.to(game.player1Id).to(game.player2Id).emit('player-disconnected', {
        message: 'Other player disconnected',
      });
    }
  });
});
