const express = require('express');
const router = express.Router();

const ManageController = require('../controllers/manage');

router.get('/next', ManageController.letInNextCustomer);

module.exports = router;