const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const constants = require('./classes/constants');
const Customer = require('./api/models/customer');
const Queue = require('./classes/queue');

global.customerQueue;
global.customerQueue = new Queue();

router.use('/public', express.static(path.join(__dirname, '/public')));
router.get('/', function(req, res, next) {
    let sessionStr = req.signedCookies[constants.QUEUE_COOKIE];
    let session = null;
    if (sessionStr) {
        session = JSON.parse(sessionStr);
    }
    let bypassExpiryMs = session ? session.ets || 0 : 0;
    let customerId = session ? session.id : '';
    let index = global.customerQueue.getCustomerIndex(customerId);
    let createNewSession = !sessionStr || (index === -1 && Date.now() >= bypassExpiryMs);
    if (createNewSession) {
        let customer = new Customer({
            _id: new mongoose.Types.ObjectId(),
            ipAddress: req.connection.remoteAddress
        });
        customer
            .save()
            .then(async function(doc) {
                let session = {
                    id: doc._id,
                    jts: doc.joinedDate.getTime()
                };

                res.cookie(constants.QUEUE_COOKIE, JSON.stringify(session), {
                    signed: true,
                    domain: process.env.DOMAIN
                });
                res.status(200).sendFile(path.join(__dirname, 'public/queue.html'));

                await global.customerQueue.addCustomer(doc.toObject());
            })
            .catch(function(error) {
                console.log(error);
                res.sendFile(path.join(__dirname, 'public/error.html'));
            });
    }
    else {
        if (Date.now() <= bypassExpiryMs) {
            let forwardUrl = process.env.STORE_URL;
            res.redirect(forwardUrl);
        }
        else {
            res.status(200).sendFile(path.join(__dirname, 'public/queue.html'));
        }        
    }
});

module.exports = router;