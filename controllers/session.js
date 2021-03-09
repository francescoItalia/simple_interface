/*************************************************************
 * SESSION Controllers
 *************************************************************/

/*********** Dependencies ************/
const config = require('../config');
const UserSchema = require('../models/userSchema');
const myLogger = require('../util/logger');

// Instantiate the session handlers object
const sessionControllers = {};

// Create a Session
// Required Fields: email, password
sessionControllers.createSession = (reqData, callback) => {
    // Only accept POST request
    if (reqData.method === 'post') {
        const userModel = new UserSchema({email, password} = reqData.payload);
        // Check that required field are provided and valid
        if(userModel.email && userModel.password) {
            userModel.login((sessionToken,errStatusCode,errMessage)=>{
                if(sessionToken && !errStatusCode) {
                    callback(200,sessionToken);
                } else {
                    callback(errStatusCode,errMessage);
                }
            })
        } else {
            callback(400, config.errors._400);
            myLogger('User error',
                `Session creation failed. 
                headers: ${JSON.stringify(reqData.headers)}
                payload: ${JSON.stringify(reqData.payload)}`
            );
        }
    } else {
        callback(405, config.errors._405)
    }
};

// End a Session
// Required Fields: tokens
sessionControllers.destroySession = (reqData, callback) => {
    if (reqData.method === 'post') {
    if(reqData.user) {
        const userModel = new UserSchema({email} = reqData.user);
        if(userModel.email) {
            userModel.logout((errStatusCode,errMessage)=>{
                if(!errStatusCode) callback(200);
                else callback(errStatusCode,errMessage);
            });
        } else {
            callback(400,config.errors._400)
        }
    } else {
        callback(401, config.errors._401);
    }
    } else {
        callback(405, config.errors._405)
    }
};

module.exports = sessionControllers;