/*************************************************************
 * USER Controllers
 *************************************************************/

/*********** Dependencies ************/
const config = require('../config');
const UserSchema = require('../models/userSchema');
const myLogger = require('../util/logger');

// Instantiate the user handlers Object
const userControllers = {};

// Create a User
// Required Fields: email, password, name, surname
userControllers.create = (reqData, callback) => {
    // Only accept POST request
    if (reqData.method === 'post') {
        
        // @ts-ignore
        const userModel = new UserSchema({email, name, surname, password} = reqData.payload);
        // Check the required fields are provided and correct
        if (userModel.email && userModel.name && userModel.surname && userModel.password) {
            userModel.register((errStatusCode,errMessage)=>{
                if(!errStatusCode) callback(200);
                else callback(errStatusCode,errMessage);
            });
        } else {
            callback(400, config.errors._400);
            myLogger('error',
                `User registration failed. 
                headers: ${JSON.stringify(reqData.headers)}
                payload: ${JSON.stringify(reqData.payload)}`
            );
        }
    } else {
        callback(405, config.errors._405);
    }
};

// Get User Data
// Required Fields: email, tokenId
userControllers.read = (reqData, callback) => {
    // Only accept GET request
    if (reqData.method === 'get') {
        if (reqData.user) {
            const email = reqData.user.email;
            const userModel = new UserSchema({email});
            // Check the required fields is provided and correct
            if (userModel.email) {
                userModel.getUserDetails((userData,errStatusCode,errMessage)=>{
                    if(userData && !errStatusCode) callback(200,userData);
                    else callback(errStatusCode,errMessage);
                })
            } else {
                callback(400, config.errors._400);
            }
        } else {
            callback(401, config.errors._403);
        }
    } else {
        callback(405, config.errors._405);
    }
};

// Update User Data
// Required Fields: either name or surname
userControllers.update = (reqData, callback) => {
    // Only accept PUT request
    if (reqData.method === 'put') {
        // if the user is authenticated
        if (reqData.user) {
            // Check the required fields are provided and correct
            const email = reqData.user.email;
            const name = reqData.payload.name;
            const surname = reqData.payload.surname;
            const userModel = new UserSchema({email, name, surname});

            if (userModel.name || userModel.surname) {
                userModel.update((errStatusCode,errMessage)=>{
                    if(!errStatusCode) callback(200);
                    else callback(errStatusCode,errMessage);
                })
            } else {
                callback(400, config.errors._400);
            }
        } else {
            callback(401, config.errors._401);
            myLogger('error',
                `User update failed. 
                headers: ${JSON.stringify(reqData.headers)}
                payload: ${JSON.stringify(reqData.payload)}
                user: ${JSON.stringify(reqData.user)}`
            );
        }
    } else {
        callback(405, config.errors._405);
    }
};

// Delete User Data
// Required Fields: email
userControllers.delete = (reqData, callback) => {
    // Only accept DELETE request
    if (reqData.method === 'delete') {
        if (reqData.user) {
            // @ts-ignore
            const userModel = new UserSchema({email} = reqData.user);
            // Check the required fields are provided and correct
            if(userModel.email) {
                userModel.delete((errStatusCode,errMessage)=>{
                    if(!errStatusCode) callback(200);
                    else callback(errStatusCode,errMessage);
                });
            } else {
                callback(400,config.errors._400)
            }
        } else {
            callback(401, config.errors._401);
            myLogger('error',
                `User deletion failed. 
                headers: ${JSON.stringify(reqData.headers)}
                payload: ${JSON.stringify(reqData.payload)}
                user: ${JSON.stringify(reqData.user)}`
            );
        }
    } else {
        callback(405, config.errors._405);
    }
};

// Send User email with instructions to reset Password 
// Required Fields: email
userControllers.sendResetPasswordEmail = (reqData, callback) => {
    // Only accept POST request
    if (reqData.method === 'post') {
        // @ts-ignore
        const userModel = new UserSchema({email} = reqData.payload);
        // Check the required fields are provided and correct
        if(userModel.email) {
            // Get the user details
            userModel.getUserDetails((userData)=>{
                if(userData) {
                    // The email provided corresponds to an existing user
                    userModel.sendResetPasswordEmail((errStatusCode,errMessage)=>{
                        if(!errStatusCode) callback(200,{'message': 'Success! If this email matches our records we will send instructions on how to reset your password'});
                        else callback(errStatusCode,errMessage);
                    })
                } else {
                    callback(200,{'message':'Success! If this email matches our records we will send instructions on how to reset your password'});
                }
            })
        } else {
            callback(200);
            myLogger('error',
            `Password Reset email provided incorrect format. 
            headers: ${JSON.stringify(reqData.headers)}
            payload: ${JSON.stringify(reqData.payload)}`
        );
        }
    } else {
        callback(405, config.errors._405);
    }
};

// Reset a User password
// Required Fields: resetPasswordToken, password
userControllers.resetPassword = (reqData, callback) => {
    // Only accept POST request
    if (reqData.method === 'post') {
        // Get the password and the reset token id form the payload
        const { resetPasswTokenId, password } = reqData.payload;
        // @ts-ignore
        const userModel = new UserSchema({ resetPasswTokenId, password });

        // Check the required fields are provided and correct
        if (userModel.resetPasswTokenId && userModel.password) {

            userModel.resetPassword((errStatusCode,errMessage) => {
                if(!errStatusCode) callback(200);
                else callback(errStatusCode,errMessage);
            });
        } else {
            callback(400, config.errors._400);
            myLogger('error',
                `Reset password failed. 
                headers: ${JSON.stringify(reqData.headers)}
                payload: ${JSON.stringify(reqData.payload)}
                searchParams: ${JSON.stringify(reqData.searchParams)}`
            );
        }
    } else {
        callback(405, config.errors._405);
    }
};

module.exports = userControllers;