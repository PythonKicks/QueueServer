const express = require('express');
const router = express.Router();

const GameController = require('../controllers/game');

router.get('/request', GameController.requestGame);

module.exports = router;