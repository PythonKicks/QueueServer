const Customer = require('../models/customer');


exports.letInNextCustomer = async function(req, res, next) {
    let validSecret = req.body.secret === process.env.SHARED_STORE_SECRET;
    if (validSecret) {
        let nextCustomer = await global.customerQueue.getNextCustomer();
        if (nextCustomer) {
            let updateOps = {
                bypassDate: Date.now()
            };
            let customerId = nextCustomer._id;
            Customer.findByIdAndUpdate(customerId, { $set: updateOps })
                .exec()
                .then(function(doc) {
                    res.status(200).json({
                        customerId: doc._id,
                        message: "Next customer queued"
                    });
                })
                .catch(function(err) {
                    res.status(200).json({
                        message: "Could not find customer"
                    });
                });
        }
        else {
            res.status(200).json({
                message: "No customer in queue"
            });
        }
    }
    else {
        res.status(500).json({
            message: "Invalid"
        });
    }
}