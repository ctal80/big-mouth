'use.strict';

const co = require("co");
const AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
console.log("Region: ", AWS.config.region);

// var proxy = require('proxy-agent');
/* AWS.config.update({
  httpOptions: { agent: proxy('http://proxy-chain.intel.com:911') }
}); */

const dynamodb = new AWS.DynamoDB.DocumentClient();

const defaultResaults = process.env.defaultResaults || 8;
const tableName = process.env.restaurants_table;



function* getRestaurants(count){
    let req = {
        TableName: "restaurants",
        Limit: count
    };

    let resp = yield dynamodb.scan(req).promise();
    return resp.Items;
}

module.exports.handler = co.wrap (function* (event, context, cb) {
     let restaurants = yield getRestaurants(defaultResaults);
     let response = {
         statusCode: 200, 
         body: JSON.stringify(restaurants)
     }

     cb(null, response);
});