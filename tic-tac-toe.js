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

const io = socketIo(server);

io.on('connection', (socket) => {
  const updateGame = (game) => {
    const player1 = players.find((player) => player.playerId === game.player1Id);
    const player2 = players.find((player) => player.playerId === game.player2Id);
    if (game.turn === 0) {
      io.to(game.player1Id).emit('game-update', {
        game: game.game,
        yourTurn: true,
        otherPlayer: player2.playerName,
      });
      io.to(game.player2Id).emit('game-update', {
        game: game.game,
        yourTurn: false,
        otherPlayer: player1.playerName,
      });
    } else {
      io.to(game.player1Id).emit('game-update', {
        game: game.game,
        yourTurn: false,
        otherPlayer: player2.playerName,
      });
      io.to(game.player2Id).emit('game-update', {
        game: game.game,
        yourTurn: true,
        otherPlayer: player1.playerName,
      });
    }
  };
  socket.on('waiting', ({ playerName }) => {
    const player = new Player(socket.id, playerName);
    players.push(player);
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
    }
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

  /*socket.on("disconnect", () => {
        const game = games.find((game) => game.includes(socket.id));
        const find = waitingList.find((user) => user.id === socket.id);
        users = users.filter((user) => user.id !== socket.id);
        if (find) {
            waitingList = waitingList.filter((user) => user.id !== socket.id);
            console.log("left waiting area");
            console.log(waitingList);
        }
        if (game) {
            games = games.filter((g) => g.gameId !== game.gameId);
            console.log("game over");
            console.log(games);
            io.to(game.player1Id).to(game.player2Id).emit("player-disconnected", {
                message: "Other player disconnected",
            });
        }
    });*/
});
