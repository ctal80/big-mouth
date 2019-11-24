'use.strict';

const co = require("co");
const AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
var proxy = require('proxy-agent');
/* AWS.config.update({
  httpOptions: { agent: proxy('http://proxy-chain.intel.com:911') }
}); */

const dynamodb = new AWS.DynamoDB.DocumentClient();

const defaultResaults = process.env.defaultResaults || 8;
const tableName = process.env.restaurants_table;

function* findRestaurantsByThem(theme, count){
    let req = {
        TableName: tableName,
        Limit: count, 
        FilterExpression: "contains(themes, :theme)",
        ExpressionAttributeValues: {":theme": theme }
    };

    let resp = yield dynamodb.scan(req).promise();
    return resp.Items;
}

module.exports.handler = co.wrap (function*(event, context, cb) {
     let req = JSON.parse(event.body);
     let restaurants = yield findRestaurantsByThem(req.theme, defaultResaults);
     let response = {
         statusCode: 200, 
         body: JSON.stringify(restaurants)
     }

     cb(null, response);
});