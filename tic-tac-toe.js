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

  const queue = {//message queue, will add any new chore, delete the cores once they are recieved.
    chores: {},// {id, chore}

  };
  let game;
  
  socket.on('join', (playerName) => {

    game = new Game(faker.datatype.number());

    rooms.push(game);

    socket.gameIndex = rooms.indexOf(game);

    console.log(`Total Rooms ${rooms.length}, ${rooms.indexOf(game)}`);

    socket.roomId = game.getRoomId();

    socket.join(socket.roomId);

    game.addPlayer(playerName, socket.id, socket, symbol[game.getPlayersCount()], numbers[game.getPlayersCount()]);

    socket.emit('message', `Welcome ${playerName.playerName}, waiting another Player, your room id is ${socket.roomId} and type this ${rooms.indexOf(game)}`);
  
  });

  socket.on('newJoin', (data) => {

    game = rooms[data.roomIndex];

    socket.roomId = data.room;

    socket.gameIndex =data.roomIndex; 

    socket.join(socket.roomId);

    game.addPlayer(data.name, socket.id, socket, symbol[game.getPlayersCount()], numbers[game.getPlayersCount()]);
    
    io.to(socket.roomId).emit('empty-message', 'Game Starts');
    
    game.setStatus(1); // In progress
  
  });

  socket.on('make-move', (data) => {

    console.log(`Game status ${game.getStatus()}`);

    if (game.getStatus() === 2) {

      console.log(`Winner is ${game.getWinner().id}`);

    }

    else if (game.getStatus() === 0) {

      socket.emit('message', 'Please Wait');

    }

    else if (game.getCurrentPlayer().id === socket.id) {

      if (game.getPositions().indexOf(data.position) === -1) {

        game.addPosition(data.position);

        const symbol = game.getCurrentPlayer().symbol;

        queue.chores[faker.datatype.number()] = [game.getCurrentPlayer().name, data.position, symbol];
        
        socket.emit('move-made', {

          position: data.position,
          symbol: symbol,

        });

        socket.to(socket.roomId).emit('move-made', {

          position: data.position,
          symbol: symbol,

        });

        if (game.updateBoard(data.position, game.getCurrentPlayer().number)) {

          socket.emit('result', 'You Win');
          socket.to(socket.roomId).emit('result', 'You Lost');

        }

        if (game.checkDraw()) {

          io.to(socket.roomId).emit('result', 'Draw');
          
        }
        game.changeTurn();

      } else {

        console.log('Position already clicked');

      }

    } else {

      socket.emit('invalid-move', 'Your Opponents Turn');

    }

  });

  socket.on('disconnect', () => {

    console.log(socket.id, 'disconnected', socket.roomId, 'socket.gameIndex', socket.gameIndex);

    if(rooms[socket.gameIndex]){

      if (rooms[socket.gameIndex].getStatus() === 0 && rooms[socket.gameIndex].getCurrentPlayersCount() === 1) {

        // when the rooms[socket.gameIndex] has not started yet but the only user in the room disconnects
        rooms[socket.gameIndex].playerLeft(socket, false);

      } else if (rooms[socket.gameIndex].getStatus() === 1) {

        // when the rooms[socket.gameIndex] is in progress but one user leaves the room
        rooms[socket.gameIndex].playerLeft(socket, true);
        io.to(socket.roomId).emit('result', 'Opponent Left! You Win');

      } else if (rooms[socket.gameIndex].getStatus() === 2 || rooms[socket.gameIndex].getCurrentPlayersCount() === 2) {

        // when the rooms[socket.gameIndex] is over and one user leaves the room
        rooms[socket.gameIndex].playerLeft(socket, false);

      } else if (rooms[socket.gameIndex].getStatus() === 2 || rooms[socket.gameIndex].getCurrentPlayersCount() === 1) {

        // when the rooms[socket.gameIndex] is over and the other user also leaves the room
        rooms[socket.gameIndex].playerLeft(socket, false);
        archivedRooms.push(rooms[socket.gameIndex]);

      }
    }

    else{

      console.log('no game started!');

    }

    //io.to(socket.roomId).emit('left', 'Opponent Left! You Win')
    //socket.on('yesWaite', () => {
    ///socket.send(queue.chores)
    //});
  });
});
