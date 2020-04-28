const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    gameId: {type: String, required: true},
    player1Id: {type: String, required: true},
    player2Id: {type: String, required: true},
    player1Won: {type: Boolean, required},
    player2Won: {type: Array, default: undefined},
    gameCreation: {type: Date, default: Date.now},
    gameFinished: {type: Date, default: undefined}
});

module.exports = mongoose.model('Game', gameSchema);