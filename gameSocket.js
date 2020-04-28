const WebSocketServer = require('websocket').server;

const GameManager = require('./classes/gameManager');
const constants = require('./classes/constants');

global.gameManager;
global.gameManager = new GameManager();

const CHOICES = [0, 1 ,2];
var CHOICE_MAP = {};

CHOICES.forEach(function(choice, i) {
    CHOICE_MAP[choice] = {};
    CHOICE_MAP[choice][choice] = void 0;
    CHOICE_MAP[choice][CHOICES[(i+1)%3]] = CHOICES[(i+1)%3];
    CHOICE_MAP[choice][CHOICES[(i+2)%3]] = choice;
})

function getWinningChoice(choice1, choice2) {
    return (CHOICE_MAP[choice1] || {})[choice2];
}

module.exports = function attachGameSocket(server) {
    wsServer = new WebSocketServer({
        httpServer: server
    });

    wsServer.on('request', function(req) {
        let connection = req.accept(null, req.origin);

        connection.on('message', async function(message) {
            if (message.type === 'utf8') {
                let data = JSON.parse(message.utf8Data);
                if (data.command == 'init') {
                    let customerId = data.customerId;
                    let gameId = data.gameId;
                    let result = await global.gameManager.initCustomer(data.gameId, customerId, connection);
                    if (result.code == constants.GAME_CODES.GAME_READY) {
                        // establish timelimit
                        let timelimit = constants.MAX_ANSWER_TIME_MS;

                        let game = await global.gameManager.getIncompleteGame(gameId);

                        let p1Con = game.getP1().connection;
                        let p2Con = game.getP2().connection;

                        let startData = {
                            command: 'start'
                        };

                        // send start
                        p1Con.sendUTF(JSON.stringify(startData));
                        p2Con.sendUTF(JSON.stringify(startData));

                        setTimeout(function() {
                            // collect results
                            let p1Choice = game.getP1Choice();
                            let p2Choice = game.getP2Choice();

                            console.log('P1 Choice: '+p1Choice);
                            console.log('P2 Choice: '+p2Choice);

                            if (p1Choice == void 0 || p2Choice == void 0) {
                                // p1 loses $ and spot
                            }
                            else {
                                let winningChoice = getWinningChoice(p1Choice, p2Choice);
                                if (winningChoice == void 0) {
                                    // tie
                                    console.log('tie');
                                }
                                else if (winningChoice == p1Choice) {
                                    // p1 wins
                                    // p2 loses
                                    console.log('p1 wins');
                                }
                                else {
                                    // p2 wins
                                    // p1 loses
                                    console.log('p2 wins');
                                }
                            }

                            // send results to clients via WS
                            
                            // log game

                            // clear from mem?
                        }, timelimit);
                    }
                    else if (result.code == constants.GAME_CODES.WAITING_OTHER) {
                        console.log('Logged first player!');
                    }
                }
                else if (data.command == 'choice') {
                    let customerId = data.customerId;
                    let gameId = data.gameId;

                    let game = await global.gameManager.getIncompleteGame(gameId);
                    let player = game.getPlayer(customerId);

                    if (!game || !player) {
                        console.log('game/player not found');
                        return;
                    }

                    if (player.choice != void 0) {
                        // choice already recorded
                        console.log('choice already recorded');
                        return;
                    }

                    let choiceStr = data.choice;
                    let choice = void 0;
                    try {
                        choice = parseInt(choiceStr);
                    } catch (e) {
                        // invalid choice
                        console.log('invalid choice');
                        return;
                    }
                    
                    if (choice < 0 || choice > 2) {
                        console.log('invalid choice');
                        // invalid choice
                        return;
                    }

                    player.choice = choice;
                    console.log('recorded choice');
                }
            }
        });

        connection.on('close', function(connection) {
            console.log((new Date()) + ' Disconnected from '+connection.remoteAddress);
        });
    });
}