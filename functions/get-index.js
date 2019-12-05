'use strict';

const co = require("co");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const Mustache = require('mustache');
const req = require('superagent');
// extend with Request#proxy()
//require('superagent-proxy')(req);
const http = require('superagent-promise')(req, Promise);
const aws4 = require('aws4');
const URL = require('url');
const awscred = Promise.promisifyAll(require('awscred'));

//const awsRegion = process.env.AWS_REGION;
const awsRegion = 'eu-west-1';
//const cognitoUserPoolId = process.env.cognito_user_pool_id;
const cognitoUserPoolId = 'eu-west-1_MucMlqr6n';
//const cognitoClientId = process.env.cognito_client_id
const cognitoClientId = '61s5uk3gbe2gtu66d3sdlhkpvs'


const restaurantsApiRoot = process.env.restaurants_api;
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//var proxy = process.env.http_proxy || 'http://proxy-chain.intel.com:911';
var html;

function* loadHtml() {
  if(!html) {                      
     html = yield fs.readFileAsync('static/index.html', 'utf-8');
  }
  return html;
}

function* getRestaurants() {
  let url = URL.parse(restaurantsApiRoot);
  let opts = {
    host: url.hostname,
    path: url.pathname
  };
  

  if(!process.env.AWS_ACCESS_KEY_ID) {
    let cred = (yield awscred.loadAsync()).credentials;
    console.log(cred.accessKeyId + "::" + cred.secretAccessKey + "!!!!!!!!!!!!!!!!!!!!!");
    process.env.AWS_ACCESS_KEY_ID = cred.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = cred.secretAccessKey;
    if(cred.sessionToken) {
      process.env.AWS_SESSION_TOKEN = cred.sessionToken;
    }
  }; 

  //sign http request to api-gateway
  aws4.sign(opts);
  
// method, url form with `then`

  let httpReq = http
   .get(restaurantsApiRoot)
   .set('Host', opts.headers['Host'])
   .set('X-Amz-Date', opts.headers['X-Amz-Date'])
   .set('Authorization', opts.headers['Authorization'])
  // .set('X-Amz-Security-Token', opts.headers['X-Amz-Security-token'])
    
  /* if (opts.headers['X-Amz-Security-token']) {
    httpReq.set('X-Amz-Security-Token', opts.headers['X-Amz-Security-token']);
  } */
  console.log("Just before getRestaurants yield !!!!!!!!!!!!!!!!!!!!!");
  return (yield httpReq).body; 
}


module.exports.handler = co.wrap (function* (event, context, callback) {
  let template = yield loadHtml();
  console.log("template is ok !!!!!!!!!!!!!!");
  console.log('restaurantsApiRoot:' + restaurantsApiRoot);
  let restaurants = yield  getRestaurants();
  console.log("After getRestaurants() Call");
  let dayOfWeek = days[new Date().getDay()];
  
  let view = {
    dayOfWeek,
    restaurants,
    awsRegion,
    cognitoUserPoolId,
    cognitoClientId,
    searchUrl: `${restaurantsApiRoot}/search`
  };

  let html = Mustache.render(template, view);
  const response =  {
    statusCode: 200,
    body: html,
    headers: {
       'content-type': 'text/html; charset=UTF-8'
    }
  };
  
  callback(null, response);
});
