/*********** Dependencies ************/
const myLogger = require('../util/logger');
const _data = require('../lib/data');
const helpers = require('../util/helpers');
const config = require('../config');
const transporter = require('../services/mailer');
const gmailAuth = require('../config/gmailAuth');
const { sendMail } = require('../services/mailer');
const PageSchema = require('./pageSchema');

class UserSchema {
    constructor(userData = {}) {
        this.name = helpers.validateString(userData.name);
        this.surname = helpers.validateString(userData.surname);
        this.password = helpers.validatePassword(userData.password) ? userData.password : false;
        this.email = helpers.validateEmail(userData.email) ? userData.email : false;
        this.resetPasswTokenId = helpers.validateStringOfLen(userData.resetPasswTokenId,30) ? userData.resetPasswTokenId : false;
    }

    getUserDetails = callback => {
        _data.read('users', this.email, (err, data) => {
            if (!err && data) {
                // delete the password && session data
                delete data.password;
                delete data.sessionToken;
                callback(data);
            } else {
                callback(null, 404, config.errors._404);
            }
        });
    };
    
    register = callback => {
        // Check if a user with provided email exist
        _data.read('users', this.email, (err, data) => {
            // if there is an error then a user with that email is not found
            // which means it doesn't exist and we can proceed
            if (err) {
                // Hash the password
                const hashedPassword = helpers.hash(this.password);
                // Form the user Object
                const user = {
                    email: this.email,
                    password: hashedPassword,
                    name: this.name,
                    surname: this.surname
                };
                // Stringify the data
                const userString = JSON.stringify(user);
                // Create the user
                _data.create('users', this.email, userString, err => {
                    if (!err) {
                        callback(false);
                    } else {
                        callback(500, config.errors._500);
                    }
                });
            } else {
                callback(400, config.errors._400);
            }
        });
    };
    
    update = callback => {
        _data.read('users', this.email,(err,userData)=>{
            if(!err && userData) {
                if (this.name) userData.name = this.name;
                if (this.surname) userData.surname = this.surname;
                if (this.password) userData.password = this.password;
                _data.update('users', this.email, JSON.stringify(userData), err => {
                    if (!err) callback(false);
                    else callback(500, config.errors._500);
                })
            } else {
                callback(500, config.errors._500);
            }
        })
    };
    
    delete = callback => {
        _data.delete('users', this.email, (err) => {
            if (!err) callback(false);
            else callback(500, config.errors._500);
        })
    };
    
    login = callback => {
        // Check if the user exists
        _data.read('users', this.email, (err, userData) => {
            if (!err && userData) {
                // Check that provided password is correct
                if (helpers.hash(this.password) === userData.password) {
                    // Check if the user is not already logged in
                    if (!userData.sessionToken) {
                        // then create a new session token
                        this.createSessionToken(userData, sessionToken => {
                            if (sessionToken) {
                                callback(sessionToken);
                            } else {
                                callback(null, 500, config.errors._500);
                            }
                        });
                    } else {
                        // If there already is a session token
                        // Check if the existing token is still valid
                        this.verifySessionValidity(userData.sessionToken.id, sessionToken => {
                            // if there is not valid session token
                            if (!sessionToken) {
                                // Create a new one
                                this.createSessionToken(userData, sessionToken => {
                                    if (sessionToken) {
                                        callback(sessionToken);
                                    } else {
                                        callback(null, 500, config.errors._500);
                                    }
                                })
                            } else {
                                // Otherwise return the existing one
                                callback(sessionToken);
                            }
                        })
                    }
                } else {
                    callback(401, config.errors._401);
                }
            } else {
                callback(404, config.errors._404);
            }
        });
    };
    
    logout = callback => {
        _data.read('users', this.email, (err,userData)=>{
            if(!err && userData) {
                const tokenId = userData.sessionToken.id;
                if(tokenId) {
                    // Lookup the token Id
                    _data.read('session_tokens', tokenId, (err, tokenData) => {
                        if (!err && tokenData) {
                            // Delete the token
                            _data.delete('session_tokens', tokenId, err => {
                                if (!err) {
                                    // Delete sessionToken from user object
                                    delete userData.sessionToken;
                                    // Update user data
                                    _data.update('users', userData.email, JSON.stringify(userData),(err)=>{
                                        if(!err) {
                                            callback(false)
                                        } else {
                                            callback(500, config.errors._500);
                                        }
                                    })
                                } else {
                                    callback(500, config.errors._500);
                                }
                            });
                        } else {
                            callback(404, config.errors._404);
                        }
                    });
                } else {
                    callback(500, config.errors._500);
                }
            }
        })
    };

    sendResetPasswordEmail = callback => {
        // Create a new reset email token
        this.createResetPasswordToken(this.email, resetEmailToken => {
            if(resetEmailToken) {
                // Get reset password email template
                const pageModel = new PageSchema();
                pageModel.getTemplate('resetEmailTemplate',{ rptid: resetEmailToken.id }, (err, templateString) => {
                    if(!err && templateString) {
                        const mailOptions = {
                            from: gmailAuth.user,
                            to: this.email,
                            subject: 'Password Reset Request | Simple Interface',
                            html: templateString
                        };
                        
                        transporter.sendMail(mailOptions, (err, info)=>{
                            if (!err) {
                                callback(false);
                            } else {
                                console.log(err);
                                myLogger('Internal error',
                                `email not sent. 
                                 email: ${JSON.stringify(this.email)},
                                 error message: ${err.message}`);
                                callback(500, config.errors._500);
                            }
                        });
                    } else {
                        myLogger('Internal error',
                        `resetEmailTemplate not returned. 
                         email: ${JSON.stringify(this.email)},
                         error message: ${err.message}`);
                         callback(500, config.errors._500);
                    }
                })
            } else {
                myLogger('Internal error',
                `resetEmailToken not returned. 
                 email: ${JSON.stringify(this.email)},
                 error message: ${err.message}`);
                 callback(500, config.errors._500);
            }
        })
    };

    // Veryfy Session
    verifySessionValidity = (sessionTokenId, callback) => {
        // Check if session exists
        _data.read('session_tokens', sessionTokenId, (err, sessionToken) => {
            if (!err, sessionToken) {
                // Check if token is valid
                if (sessionToken.validUntil < Date.now()) callback(false);
                else callback(sessionToken);
            } else {
                callback(false);
            }
        })
    };

    // Create Session Token
    createSessionToken = (userData, callback) => {
        // Create session token string
        const sessionTokenId = helpers.createRandomString(20);
        // Set expiration in 1h
        const expires = Date.now() + 1000 * 60 * 60;
        // Instantiate the session token object
        const sessionToken = {
            id: sessionTokenId,
            email: userData.email,
            validUntil: expires
        };
        // Stringify the token
        const sessionTokenStr = JSON.stringify(sessionToken);
        // Save the token
        _data.create('session_tokens', sessionTokenId, sessionTokenStr, err => {
            if (!err) {
                // Update the user data with the session token data
                userData.sessionToken = sessionToken;
                _data.update('users', userData.email, JSON.stringify(userData), err => {
                    if (!err) {
                        callback(sessionToken);
                    } else {
                        callback(false);
                        myLogger('Internal error',
                        `Error while updating user with token data. 
                         sessionTokenId: ${JSON.stringify(sessionTokenId)},
                         sessionTokenStr: ${JSON.stringify(sessionTokenStr)},
                         userEmail: ${JSON.stringify(userData.email)},
                         error message: ${err.message}`);
                    }
                })
            } else {
                callback(false);
                myLogger('Internal error',
                `Error while Creating token. 
                 sessionTokenId: ${JSON.stringify(sessionTokenId)},
                 sessionTokenStr: ${JSON.stringify(sessionTokenStr)},
                 error message: ${err.message}`);
            }
        });
    };

    // Create Reset password Token
    createResetPasswordToken = (userEmail, callback) => {
        // Create session token string
        const resetEmailTokenId = helpers.createRandomString(30);
        // Set expiration in 10 minutes
        const expires = Date.now() + 1000 * 60 * 10;
        // Instantiate the session token object
        const sessionToken = {
            id: resetEmailTokenId,
            email: userEmail,
            validUntil: expires
        };
        // Stringify the token
        const resetEmailTokenStr = JSON.stringify(sessionToken);
        // Save the token
        _data.create('password_reset_tokens', resetEmailTokenId, resetEmailTokenStr, err => {
            if (!err) {
                callback(sessionToken);
            } else {
                callback(false);
            }
        });
    };

    // Check reset password token validity
    verifyResetPasswordTokenValidity = (callback) => {
        // Check that token provided is a valid string of lenght 30
        if(this.resetPasswTokenId) {
            // Check if token exists
            _data.read('password_reset_tokens', this.resetPasswTokenId, (err, resetPasswordToken) => {
                if (!err, resetPasswordToken) {
                    // Check if token is valid
                    if (resetPasswordToken.validUntil < Date.now()) callback(false);
                    else callback(true);
                } else callback(false);
            })
        } else callback(false);
    };

    resetPassword = (callback) => {
        // Get the resetToken Data
        _data.read('password_reset_tokens', this.resetPasswTokenId, (err, resetToken) => {
            if(!err && resetToken) {
                // Get the user and set it in the model instance
                this.email = resetToken.email;
                // Hash the password
                this.password = helpers.hash(this.password);
                // Update the user
                this.update((errStatusCode, errMessage) => {
                    if(!errStatusCode) callback(200);
                    else callback(errStatusCode, errMessage);
                });
            } else {
                callback(500, config.errors._500)
            }
        })
    }
}

module.exports = UserSchema;



