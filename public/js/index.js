var global;

function requestGame() {
    $.ajax({
        type: 'GET',
        url: '/api/game/request',
        success: function(res) {
            console.log(res);
            let code = res.code;
            if (code == global.RESP_CODES.SUCCESS) {
                global.customerId = res.customerId;
                initGame(global, res.gameId);
            }
        }
    });
}

function recordChoice(choice) {
    sendChoice(global, choice);
}

function getTSString() {
    return new Date().toUTCString();
}

function startAnimation() {
    let offset = 0;
    let offsetInc = 100;
    let cycle = 600;
    $('#animation').children('.dot').each(function() {
        let dot = this;
        let riseFunc = function() {
            $(dot).animate({
                'margin-top': '100px'
            }, {
                duration: cycle,
                easing: 'swing',
                complete: lowerFunc
            });
        };
        let lowerFunc = function() {
            $(dot).animate({
                'margin-top': '200px'
            }, {
                duration: cycle,
                easing: 'swing',
                complete: riseFunc
            });
        };
        setTimeout(function() {
            riseFunc();
        }, offset);
        offset += offsetInc;
    })
}

$(document).ready(function() {
    global = window || document || {};
    global.REFRESH = 20000;
    global.RESP_CODES = {
        SUCCESS: 100,
        PLAY_GAME: 101,
        PURCHASE: 102,
        IN_GAME_QUEUE: 103,
        MISSING_COOKIE: 104,
        ERROR: 105
    };
    global.GAME_CODES = {
        SUCCESS: 200,
        GAME_NOT_FOUND: 201,
        NOT_PARTCIPANT: 202,
        ALREADY_INIT: 203,
        GAME_READY: 204,
        WAITING_OTHER: 205
    };
    global.getCookie = function(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
    }

    function purchase(res) {
        let url = res.url;
        if (url) {
            window.location.href = url;
        }
        else {
            // for some reason URL was not present
        }
    }

    function poll() {
        $.ajax({
            type: 'GET',
            url: '/api/poll/update',
            success: function(res) {
                if (res.customerId) {
                    global.customerId = res.customerId;
                }
                switch (res.code) {
                    case RESP_CODES.SUCCESS:
                        pos = res.pos;
                        $('#position').text(`Current Position: ${pos}`);
                        $('#updateTime').text(`Last Updated: ${getTSString()}`);
                        break;
                    case RESP_CODES.PLAY_GAME:
                        startGame(res);
                        break;
                    case RESP_CODES.PURCHASE:
                        purchase(res);
                        break;
                    case RESP_CODES.MISSING_COOKIE:
                        location.reload();
                        break;
                    case RESP_CODES.ERROR:
                        console.log(res);
                        break;
                    default:
                        console.log(res);
                        break;
                }
            }
        });
    }
    $('#updateTime').text(`Last Updated: ${getTSString()}`);
    setInterval(poll, global.REFRESH);
})