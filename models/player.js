'use strict';

function Player(name, id, socket, symbol, number) {
    this.name = name;
    this.id = id;
    this.socket = socket;
    this.symbol = symbol;
    this.number = number;
};

module.exports = Player;