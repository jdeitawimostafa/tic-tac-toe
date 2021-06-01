'use strict';

class Game {
    constructor(player1Id, player2Id) {

        this.player1Id = player1Id;

        this.player2Id = player2Id;

        this.gameId = Math.random();

        this.turn = Math.floor(Math.random() * 2);

        this.game = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
    }
}

module.exports = Game;
