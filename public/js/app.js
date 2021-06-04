
'use strict';

console.log('🚀 ~ file: app.js ~ line 15 ~ $ ~ playerName');
const message = document.querySelector('.message');
const content = document.querySelector('.content');

//const url = new URL(window.location.href);
//const playerName = url.searchParams.get('username');



//message.innerHTML = `Don't worry <strong>${playerName}</strong>, your opponent is coming. Here's some random facts to pass the time.`;
const socket = io();

$('#new').on('click', () => {
  const playerName = $('#nameNew').val();
  console.log('playerName ',playerName );
  if (!playerName) {
    alert('Please enter your name.');
    return;
  }
  console.log('connection playerName ',playerName );
  socket.emit('createGame', { playerName });
});

$('#join').on('click', () => {
  const name = $('#nameJoin').val();
  const roomID = $('#room').val();
  if (!name || !roomID) {
    alert('Please enter your name and game ID.');
    return;
  }
  socket.emit('joinGame', { name:name, room: roomID });
});

/* 
const socket = io();

socket.on('connect', () => {
  socket.emit('waiting', { playerName });
}); */

socket.on('game-update', (msg) => {
  const { game, yourTurn, otherPlayer } = msg;
  const turnMessage = yourTurn
    ? `Your Turn`
    : `Waiting for other player to make move`;
  content.innerHTML = ` ${turnMessage}
                    <div class='game'></div>
                ${otherPlayer}`;
  const grid = document.querySelector('.game');
  grid.innerHTML = '';
  console.log(game);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let letter = ' ';
      if (game[i][j] === 1) letter = 'X';
      else if (game[i][j] === 25) letter = 'O';
      grid.innerHTML += `<div class='game-block'>${letter}</div>`;
    }
  }
  if (yourTurn) {
    const gameblocks = document.querySelectorAll('.game-block');
    gameblocks.forEach((block, index) => {
      block.addEventListener('click', () => makeMove(index));
    });
  }
});

socket.on('player-disconnected', ({ message }) => {
  alert(message);
  document.location.href = '/';
});

socket.on('server-message', (message) => {
  console.log(message);
});

socket.on('game-over', (obj) => {
  console.log(obj);
  alert(obj.message);
  document.location.href = '/';
});

const makeMove = (move) => {
  console.log(move);
  socket.emit('move', { move });
};