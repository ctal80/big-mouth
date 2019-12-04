'use strict'

const co = require('co');
const Promise = require('bluebird');


let initialized = false;

let init = co.wrap(function*(){

    if(initialized){
        return;
    }

    process.env.restaurants_api= "https://odcddb6cs0.execute-api.eu-west-1.amazonaws.com/dev/restaurants";
    process.env.restaurants_table = "restaurants";
    process.env.AWS_REGION = "eu-west-1";
    process.env.cognito_client_id=  "61s5uk3gbe2gtu66d3sdlhkpvs";
    process.env.cognito_user_pool_id=  "eu-west-1_MucMlqr6n";
    process.env.cognito_server_client_id=  "46bpvghchich5epea1ar319q0d";
    process.env.AWS_PROFILE = "demo";
   
    //let cred = (yield awscred.loadasync()).credentials;
        
    console.log("AWS credentials loaded");
    initialized = true; 
});


module.exports.init = init;