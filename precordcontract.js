

'use strict';
// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');
const PRecord = require('./precord.js');
const PRecordList = require('./precordlist.js');
let dashcore = require('@dashevo/dashcore-lib');
const got = require('got');
/**
 * A custom context provides easy access to list of all commercial papers
 */
class PRecordContext extends Context {

    constructor() {
        super();
        this.PRecordList = new PRecordList(this);
    }

}

/**
 * Define commercial paper smart contract by extending Fabric Contract class
 *
 */
class Precordcontract extends Contract {

    constructor() {
        super('org.asu.precordcontract');
    }

    /**
     * Define a custom context for commercial paper
    */
    createContext() {
        return new PRecordContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async init(ctx) {
        console.log("Context set and contract instantiated")
    }



    /**
     * Create an insurance record
     * @param {Context} ctx the transaction context
     * @param {String} username username
     * @param {String} name name
     * @param {String} dob date of birth
     * @param {String} gender  gender
     * @param {String} blood_type blood type
     */
    async createPRecord(ctx, username, name, dob, gender, blood_type, base_url, address, pk, token) {
        //  Write a OP-RETURN transaction to Dash Public Blockchain
        //  create an PRecord with username,name,dob,gender,blood_type,and transaction ID none
        //  If patient bloodType AB- insert record to blockchain using
        //  addPRecord of PRecordList
        //  Fetch the transactions for the address {address:base_url,address,token}
        //  Compute the total amount of all the raw transactions fetched.
        //  If the total amount  is less than amount+fee raise an error Insufficient funds
        //  Else if total amount  is greater than or equal  to amount+fee
        //  Create a transaction using the {dashcore} library, and send the transaction using ChainRider
        //  Send Raw Transaction API - https://www.chainrider.io/docs/dash/#send-raw-transaction
        //  Resulting transaction ID (dashTx) is used to create an PRecord given in the following code
        let fee=10000
        let ammount=10000
        var dashTx = 'None';
        let payload = { 'name': name}
        if (blood_type === 'AB-'){

            let url =`${base_url}/addr/${address}/utxo?token=${token}`
    
            const response = await got(url);  
            let utxo_obj2 = JSON.parse(response.body)[0];
            var transaction = new dashcore.Transaction()
                .from(utxo_obj2)
                .change(address)
                .addData(JSON.stringify(payload))
                .sign(pk)

            var rawtx = transaction.serialize();
            var requestBody = {
                'rawtx':rawtx,
                'token':token

            };
            let sendurl = 'https://api.chainrider.io/v1/dash/testnet/tx/send';
            const {body} = await got.post(sendurl, {
                hooks:{
                    beforeRequest:[
                        options => {
                            options.body = JSON.stringify(requestBody);
                            options.headers['Content-Type'] = 'application/json';
                            options.headers['Accept'] = 'application/json';
                        }
                    ]
                },
                responseType: 'json'
            });
            dashTx = JSON.parse(body)['txid']  
        }

        let precord = PRecord.createInstance(username, name, dob, gender, blood_type, dashTx);
        await ctx.PRecordList.addPRecord(precord);
        return precord.toBuffer()
    }

    /**
     * Update last_checkup_date to an existing record
     * @param {Context} ctx the transaction context
     * @param {String} username username
     * @param {String} name name
     * @param {String} last_checkup_date date string 
     */
    async update_checkup_date(ctx,username,name,last_checkup_date){
        let precordKey = PRecord.makeKey([username,name]);
        let precord = await ctx.PRecordList.getPRecord(precordKey);

        precord.set_last_checkup_date(last_checkup_date);
        await ctx.PRecordList.updatePRecord(precord);

        return precord.toBuffer();

    }

    /**
     * Evaluate a queryString
     * This is the helper function for making queries using a query string
     *
     * @param {Context} ctx the transaction context
     * @param {String} queryString the query string to be evaluated
    */    
   async queryWithQueryString(ctx, queryString, token) {
    console.log("query String");
    console.log(JSON.stringify(queryString));

    let resultsIterator = await ctx.stub.getQueryResult(queryString);

    let allResults = [];

    while (true) {
        let res = await resultsIterator.next();

        if (res.value && res.value.value.toString()) {
            let jsonRes = {};

            console.log(res.value.value.toString('utf8'));

            jsonRes.Key = res.value.key;

            try {
                jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));

                if (jsonRes.Record['tx']!=='None'){
                    //  When iterating through records that the function is returning check if this record has a TX field
                    //  IF YES - we call https://www.chainrider.io/docs/dash/#transaction-by-hash API to return a JSON of that transaction
                    //  From the transaction get OP-RETURN data
                    //  Convert the hex value of OP-ReturnData to ASCII and append it to the record as jsonRes.Record['tx_decoded']

                    let dashTx = jsonRes.Record['tx'];   
                    let txurl = `https://api.chainrider.io/v1/dash/testnet/tx/${dashTx}?token=${token}`;
                    let tx_response = await got(txurl);
                    let tx_detail = JSON.parse(tx_response.body)
                    let hexcode = tx_detail['vout'][0]['scriptPubKey']['asm'].split(' ')[1]
                    let decode_tx = Buffer.from(hexcode, 'hex').toString('ascii')
                    jsonRes.Record['tx_decoded'] = decode_tx

                    
                }
            } catch (err) {
                console.log(err);
                jsonRes.Record = res.value.value.toString('utf8');
            }

            allResults.push(jsonRes);
        }
        if (res.done) {
            console.log('end of data');
            await resultsIterator.close();
            console.info(allResults);
            console.log(JSON.stringify(allResults));
            return JSON.stringify(allResults);
        }
    }

}

    /**
     * Query by TXID
     *
     * @param {Context} ctx the transaction context
     * @param {String} gender gender to be queried
    */

    async queryByTxId(ctx, token) {


       let queryString = {
        "selector": {
            "tx": tx
        },
    }

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString), token);
    return queryResults

}
   async queryByGender(ctx, gender, token) {

    let queryString = {
        "selector": {
            "gender": gender
        }
    }

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString), token);
    return queryResults;

}

    /**
     * Query by Blood_Type
     *
     * @param {Context} ctx the transaction context
     * @param {String} blood_type blood_type to queried
    */
   async queryByBlood_Type(ctx, blood_type, token) {

    let queryString = {
        "selector": {
            "blood_type": blood_type
        }
    }

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString), token);
    return queryResults;

}

    /**
     *
     *  Query by Blood_Type Dual Query
     *
     * @param {Context} ctx the transaction context
     * @param {String} blood_type blood_type to queried
    */
   async queryByBlood_Type_Dual(ctx, blood_type1, blood_type2, token) {

    let queryString = {
        "selector": {
            "blood_type": {
                "$in": [blood_type1, blood_type2]
            }
        }
    }

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString),token);
    return queryResults;

}



}


module.exports = Precordcontract;
