const express = require('express');
const router = express.Router();

const PollingController = require('../controllers/polling');

router.get('/update', PollingController.updateCustomer);

module.exports = router;