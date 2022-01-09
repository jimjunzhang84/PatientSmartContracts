'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./ledger-api/statelist.js');

const PRecord = require('./precord.js');

class Precordlist extends StateList {
    constructor(ctx) {
        super(ctx,'org.papernet.precordlist');
        this.use(PRecord);
    }

    async addPRecord(precord) {
        return this.addState(precord);
    }

    async getPRecord(precordKey) {
        return this.getState(precordKey);
    }

    async updatePRecord(precord) {
        return this.updateState(precord);
    }


}

module.exports = Precordlist;
