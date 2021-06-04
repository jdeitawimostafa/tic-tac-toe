'use strict';

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log('listening on port ' + PORT));
const io = require('socket.io')(server);
const path = require('path');
const Game = require('./models/game');
const root = path.join(__dirname, 'public');
const faker = require('faker');

const symbol = ['X', 'O'];
const numbers = [1, -1];

app.use(express.static(root));
app.get('/' , (req, res) => {
  res.sendFile('index.html', {root});
});


let rooms = []; 
let archivedRooms = []; 

io.on('connection', (socket) => {
  let game;
  socket.on('join', (playerName) => {
    if (rooms.length === 0 || rooms[rooms.length-1].getPlayersCount() === 2) {
      game = new Game(faker.datatype.number());
      rooms.push(game);
      console.log(`Total Rooms ${rooms.length}`);
    } else {
      game = rooms[rooms.length - 1];
    }
    socket.roomId = game.getRoomId();
    socket.join(socket.roomId);
    game.addPlayer(playerName, socket.id, socket, symbol[game.getPlayersCount()], numbers[game.getPlayersCount()]);
    if (game.getPlayersCount() === 1) {
      socket.emit('message', `Welcome ${playerName.playerName}, waiting another Player, your room id is ${socket.roomId}`);
    }
  });
  socket.on('newJoin', (data) => {
    game = rooms[rooms.length - 1];
    socket.roomId = data.room;
    socket.join(socket.roomId);
    game.addPlayer(data.name, socket.id, socket, symbol[game.getPlayersCount()], numbers[game.getPlayersCount()]);
    if (game.getPlayersCount() === 2) {
      io.to(socket.roomId).emit('empty-message', 'Game Starts');
      game.setStatus(1); // In progress
    }
  });
});
