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

$('.tic').click( function(e) {
    e.preventDefault();
    const position = $(this).attr("id");
    socket.emit('make-move', {
        position: position
    });
});

socket.on('move-made', (data) => {
    $('#' + data.position).text(data.symbol);
    $('#message').text('');
});

socket.on('invalid-move', (msg) => {
    $('#message').text(msg);
});

socket.on('result', (msg) => {
    $('#message').text(msg);
});

socket.on('message', (msg) => {
    $('#message').text(msg);
});

socket.on('empty-message', (msg) => {
    $('#message').text(msg);
});