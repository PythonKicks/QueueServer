module.exports = Object.freeze({
    QUEUE_COOKIE: '__queue_sess',
    MAX_PURCHASE_TIME_MS: 10 * 60 * 1000,
    MAX_ANSWER_TIME_MS: 15 * 1000,
    RESP_CODES: {
        SUCCESS: 100,
        PLAY_GAME: 101,
        PURCHASE: 102,
        IN_GAME_QUEUE: 103,
        MISSING_COOKIE: 104,
        ERROR: 105
    },
    GAME_CODES: {
        SUCCESS: 200,
        GAME_NOT_FOUND: 201,
        NOT_PARTCIPANT: 202,
        ALREADY_INIT: 203,
        GAME_READY: 204,
        WAITING_OTHER: 205
    }
});