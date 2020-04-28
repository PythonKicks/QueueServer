window.WebSocket = window.WebSocket || window.MozWebSocket;

function initGame(global, gameId) {
    if (!global.gameConnection) {
        global.gameConnection = new WebSocket('ws://'+window.location.host);
        global.gameId = gameId;

        global.gameConnection.onopen = function() {
            console.log('Starting connection...')
            let data = {
                command: 'init',
                gameId: gameId,
                customerId: global.customerId
            };
            global.gameConnection.send(JSON.stringify(data));
        };
    
        global.gameConnection.onerror = function(error) {
            console.log(error);
            // an error occurred when sending/receiving data
        };
    
        global.gameConnection.onmessage = function(message) {
            // try to decode json (I assume that each message
            // from server is json
            let data = null;
            try {
                data = JSON.parse(message.data);
            } catch (e) {
                console.log(e);
                // log error
                return;
            }
            
            if (data.command == 'start') {
                // show game options
                console.log('Start game!');
            }
            else if (data.command == 'results') {
                // show game results
                // shutdown
            }
        };
    }
    else {
        console.log('Connection already exists');
    }
}

function sendChoice(global, choice) {
    if (!global.gameConnection) {
        return;
    }

    let choiceData = {
        command: 'choice',
        choice: choice+'',
        gameId: global.gameId,
        customerId: global.customerId
    };

    global.gameConnection.send(JSON.stringify(choiceData));
}