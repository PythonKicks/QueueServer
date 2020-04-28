const constants = require('../../classes/constants');

const Customer = require('../models/customer');

exports.requestGame = function(req, res, next) {
    let sessionStr = req.signedCookies[constants.QUEUE_COOKIE];
    
    if (!sessionStr) {
        // cookies not available
        res.status(200).json({
            code: constants.RESP_CODES.MISSING_COOKIE
        });
    }
    else {
        let session = JSON.parse(sessionStr);
        Customer.findByIdAndUpdate(session.id)
            .exec()
            .then(async function(doc) {
                let gameId = await global.gameManager.addCustomerToQueue(doc.toObject());
                if (gameId) {
                    res.status(200).json({
                        customerId: session.id,
                        gameId: gameId,
                        code: constants.RESP_CODES.SUCCESS
                    })
                }
                else {
                    res.status(200).json({
                        message: 'Could not add customer',
                        code: constants.RESP_CODES.ERROR
                    });
                }
            })
            .catch(function(err) {
                console.log(err);
                res.status(200).json({
                    message: 'Unexpected error',
                    code: constants.RESP_CODES.ERROR
                });
            });
    }
}