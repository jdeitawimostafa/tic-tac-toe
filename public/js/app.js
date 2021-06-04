'use strict';

const socket = io();

$('#new').on('click', () => {
  const playerName = $('#nameNew').val();
  console.log('playerName ',playerName );
  if (!playerName) {
    alert('Please enter your name.');
    return;
  }
  console.log('connection playerName ',playerName );
  socket.emit('join', { playerName });
});

$('#join').on('click', () => {
  const name = $('#nameJoin').val();
  const roomID = $('#room').val();
  if (!name || !roomID) {
    alert('Please enter your name and game ID.');
    return;
  }
  socket.emit('newJoin', { name:name, room: roomID });
});
