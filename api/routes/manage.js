const express = require('express');
const router = express.Router();

const ManageController = require('../controllers/manage');

router.post('/next', ManageController.letInNextCustomer);

module.exports = router;