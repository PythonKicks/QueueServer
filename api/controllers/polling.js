const constants = require('../../classes/constants');

const Customer = require('../models/customer');


exports.updateCustomer = function(req, res, next) {
    let sessionStr = req.signedCookies[constants.QUEUE_COOKIE];
    
    if (!sessionStr) {
        // cookies not available
        res.status(200).json({
            code: constants.RESP_CODES.MISSING_COOKIE
        });
    }
    else {
        let updateOps = {
            heartbeat: Date.now()
        };
        let session = JSON.parse(sessionStr);
        Customer.findByIdAndUpdate(session.id, { $set: updateOps })
            .exec()
            .then(function(doc) {
                // if customer is ready to be forwarded to main site
                // send different code and set appropriate cookies

                let bypassDate = doc.bypassDate;
                if (bypassDate) {
                    doc.bypassDate = undefined;
                    doc.save()
                        .then(function(doc) {
                            let expiryTs = bypassDate.getTime() + constants.MAX_PURCHASE_TIME_MS;
                            session.ets = expiryTs;
                            res.cookie(constants.QUEUE_COOKIE, JSON.stringify(session), {
                                signed: true,
                                domain: process.env.DOMAIN
                            });
                            let forwardUrl = process.env.STORE_URL;
                            res.status(200).json({
                                code: constants.RESP_CODES.PURCHASE,
                                url: forwardUrl
                            });
                        })
                        .catch(function(err) {
                            console.log(err);
                            res.status(200).json({
                                code: constants.RESP_CODES.ERROR
                            });
                        });
                }
                else {
                    let index = global.customerQueue.getCustomerIndex(session.id);
                    let position = index > -1 ? index + 1 : 'N/A';
                    res.status(200).json({
                        pos: position,
                        customerId: session.id,
                        code: constants.RESP_CODES.SUCCESS
                    });
                }
            })
            .catch(function(err) {
                console.log(err);
                res.status(200).json({
                    code: constants.RESP_CODES.ERROR
                });
            });
    }
}