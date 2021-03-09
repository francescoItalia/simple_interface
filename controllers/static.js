/*************************************************************
 * STATIC Controllers
 *************************************************************/

/*********** Dependencies ************/
const helpers = require('../util/helpers');
const config = require('../config');
const path = require('path');
const StaticPageSchema = require('../models/staticPageSchema');
const UserSchema = require('../models/userSchema');

// Instantiate the handlers object
const staticController = {};

staticController.ping = (reqData, callback) => {
    callback(200, {
        Status: `Server Ok`
    })
}

staticController.home = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        const staticPageModel = new StaticPageSchema('home');
        staticPageModel.getView((errStatusCode,view)=>{
            if(!errStatusCode && view) callback(200,view,'html');
            else callback(errStatusCode, undefined, 'html');
        });
    } else {
        callback(405, undefined, 'html');
    }
};

staticController.signup = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {

        // Check that the user is logged in
        if (reqData.user) {
            // If User is logged in, redirect him to my-profile page
            callback(301, undefined, undefined, {
                Location: `${config.domain}/my-profile`
            })
        } else {
            const staticPageModel = new StaticPageSchema('signup');
            staticPageModel.getView((errStatusCode,view)=>{
                if(!errStatusCode && view) callback(200,view,'html');
                else callback(errStatusCode, undefined, 'html');
            });
        }
    } else {
        callback(405, undefined, 'html');
    }
};

staticController.login = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        // Check that the user is logged in
        if (reqData.user) {
            // If User is logged in, redirect him to my-profile page
            callback(301, undefined, undefined, {
                Location: `${config.domain}/my-profile`
            })
        } else {
            const staticPageModel = new StaticPageSchema('login');
            staticPageModel.getView((errStatusCode,view)=>{
                if(!errStatusCode && view) callback(200,view,'html');
                else callback(errStatusCode, undefined, 'html');
            });
        }
    } else {
        callback(405, undefined, 'html');
    }
};

staticController.forgotPassword = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        // Check that the user is logged in
        if (reqData.user) {
            // If User is logged in, redirect him to my-profile page
            callback(301, undefined, undefined, {
                Location: `${config.domain}/my-profile`
            })
        } else {
            const staticPageModel = new StaticPageSchema('forgotPassword');
            staticPageModel.getView((errStatusCode,view)=>{
                if(!errStatusCode && view) callback(200,view,'html');
                else callback(errStatusCode, undefined, 'html');
            });
        }
    } else {
        callback(405, undefined, 'html');
    }
};

staticController.resetPassword = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        // Check that the user is logged in
        if (reqData.user) {
            // If User is logged in, redirect him to my-profile page
            callback(301, undefined, undefined, {
                Location: `${config.domain}/my-profile`
            })
        } else {
            // Check if a valid Reset Password Token Id (rpti) is passed
            const resetPasswTokenId = reqData.searchParams.get('rptid');
            if (resetPasswTokenId) {
                const userModel = new UserSchema({ resetPasswTokenId });
                userModel.verifyResetPasswordTokenValidity(isValid => {
                    if(isValid) {
                        // Build the static page model from schema
                        const staticPageModel = new StaticPageSchema('resetPassword');
    
                        // Call the static page model to get the view
                        staticPageModel.getView((errStatusCode,view) => {
                            if(!errStatusCode && view) callback(200,view,'html');
                            else callback(errStatusCode, undefined, 'html');
                        });
                    } else staticController.notFound(undefined, callback);
                })
            } else staticController.notFound(undefined, callback);
        }
    } else callback(405, undefined, 'html');
};

// Public Resources Handler
// Required Fields: asset
staticController.assets = (reqData, callback) => {
    // Get asset name from route
    const assetPath = reqData.path.replace('assets/', '');
    //Check that required fields are provided and valid
    if (assetPath) {
        // Get the static asset
        helpers.getStaticAsset(assetPath, (err, assetData) => {
            if (!err && assetData) {
                const parsedAssetPath = path.parse(assetPath);
                // Get the file extension
                const contentType = parsedAssetPath.ext.replace('.', '');
                callback(200, assetData, contentType);
            } else {
                callback(404, undefined, 'plain');
            }
        });
    } else {
        callback(404, undefined, 'plain');
    }
};

// Not Found Resource Handler
staticController.notFound = (reqData, callback) => {
    const staticPageModel = new StaticPageSchema('notFound');
    staticPageModel.getView((errStatusCode,view)=>{
        if(!errStatusCode && view) callback(404,view,'html');
        else callback(errStatusCode, undefined, 'html');
    });
};

module.exports = staticController;