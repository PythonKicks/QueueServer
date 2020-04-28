const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ipAddress: {type: String, required: true},
    joinedDate: {type: Date, default: Date.now},
    heartbeat: {type: Date, default: undefined},
    bypassDate: {type: Date, default: undefined},
    gamesPlayed: {type: Number, default: 0},
    gamesWon: {type: Number, default: 0}
});

module.exports = mongoose.model('Customer', customerSchema);