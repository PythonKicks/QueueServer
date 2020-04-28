const { Mutex } = require('async-mutex');


module.exports = class Queue {
    constructor() {
        this.queue = [];
        this.mutex = new Mutex();
    }

    getCustomerIndex(customerId) {
        return this.queue.findIndex(function(e) {
            return e._id.toString() === customerId;
        });
    }

    async addCustomer(customer) {
        const release = await this.mutex.acquire();

        let index = this.queue.findIndex(function(e) {
            return e._id.toString() === customer._id.toString();
        });

        if (index == -1) {
            this.queue.push(customer);
        }

        release();

        return index == -1;
    }

    async getNextCustomer() {
        const release = await this.mutex.acquire();

        let customer = this.queue.shift();

        release();

        return customer;
    }
}