const { Mutex } = require('async-mutex');

const constants = require('./constants');

class Game {
    constructor(p1Id) {
        this.player1 = {
            id: p1Id,
            connection: void 0,
            validateId: Game.getUuid(),
            status: 'init',
            choice: void 0,
            wonGame: void 0
        };
        this.player2 = {
            id: '',
            connection: void 0,
            validateId: Game.getUuid(),
            status: 'init',
            choice: void 0,
            wonGame: void 0
        };
        this.status = 'init';
        this.id = Game.getUuid();
    }

    getP1() {
        return this.player1;
    }

    getP2() {
        return this.player2;
    }

    setP1Status(status) {
        this.player1.status = status;
    }

    setP2Status(status) {
        this.player1.status = status;
    }

    getP1Choice() {
        return this.player1.choice;
    }

    getP2Choice() {
        return this.player2.choice;
    }

    setP1Choice(choice) {
        this.player1.choice = choice;
    }

    setP2Choice(choice) {
        this.player2.choice = choice;
    }

    setStatus(status) {
        this.status = status;
    }

    getStatus() {
        return this.status;
    }

    getId() {
        return this.id;
    }

    getPlayer(customerId) {
        if (this.player1.id == customerId) {
            return this.player1;
        }
        if (this.player2.id == customerId) {
            return this.player2;
        }
        return null;
    }

    isParcipant(customerId) {
        return this.player1.id == customerId || this.player2.id == customerId;
    }

    static getUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

module.exports = class GameManager {
    constructor() {
        this.pendingGame = null;
        this.incompleteGames = [];
        this.completeGames = [];
        this.customerMutex = new Mutex();
        this.gamesMutex = new Mutex();
    }

    // adds customer to the queue
    // returns the gameId if customer was added
    // returns null if customer could not be added
    async addCustomerToQueue(customer) {
        let gameId = null;
        
        const release = await this.gamesMutex.acquire();

        let customerId = customer._id.toString();

        let isParcipant = this.pendingGame && this.pendingGame.isParcipant(customerId);

        let incompleteIndex = this.incompleteGames.findIndex(function(e) {
            return e.isParcipant(customerId);
        });

        if (!isParcipant && incompleteIndex == -1) {
            // no player wating
            if (this.pendingGame == null) {
                this.pendingGame = new Game(customerId);
                gameId = this.pendingGame.getId();
            }
            else {
                this.pendingGame.getP2().id = customerId;
                gameId = this.pendingGame.getId();
                this.incompleteGames.push(this.pendingGame);
                this.pendingGame = null;
            }
        }

        release();

        return gameId;
    }

    async initCustomer(gameId, customerId, connection) {
        let game = null;
        const release = await this.gamesMutex.acquire();

        if (this.pendingGame && this.pendingGame.isParcipant(customerId)) {
            game = this.pendingGame;
        }

        if (!game) {
            let index = this.incompleteGames.findIndex(function(e) {
                return e.getId() == gameId;
            });
    
            if (index > -1) {
                game = this.incompleteGames[index];
            }
        }

        if (!game) {
            release();
            return {
                code: constants.GAME_CODES.GAME_NOT_FOUND
            };
        }

        if (!game.isParcipant(customerId)) {
            release();
            return {
                code: constants.GAME_CODES.NOT_PARTCIPANT
            };
        }

        if (game.getStatus() != 'init') {
            release();
            return {
                code: constants.GAME_CODES.ALREADY_INIT
            };
        }

        let player = game.getPlayer(customerId);
        player.status = 'waiting';
        player.connection = connection;

        let code = constants.GAME_CODES.WAITING_OTHER;
        if (game.getP1().status == 'waiting' && game.getP2().status == 'waiting') {
            // game ready
            game.setStatus('progress');
            code = constants.GAME_CODES.GAME_READY;
        }

        release();

        return {
            validateId: player.validateId,
            code: code
        };
    }

    async getIncompleteGame(gameId) {
        let game = null;

        const release = await this.gamesMutex.acquire();

        let index = this.incompleteGames.findIndex(function(e) {
            return e.getId() == gameId;
        });

        if (index == -1) {
            release();
            return {
                code: constants.GAME_CODES.GAME_NOT_FOUND
            };   
        }

        game = this.incompleteGames[index];

        release();

        return game;
    }
}