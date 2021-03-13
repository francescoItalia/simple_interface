/*************************************************************
 * PROFILE Controllers
*************************************************************/

/*********** Dependencies ************/
const config = require('../config');
const ProfileSchema = require('../models/profileSchema');

// Instantiate the handlers object
const profileController = {};

// my-profile Handler
profileController.profile = (reqData, callback) => {
    // Only accept get requests
    if (reqData.method === 'get') {
        // Check that the user is logged in
        if (reqData.user) {
            const profileModel = new ProfileSchema(reqData.user.email);
            profileModel.getView((errStatusCode,view)=>{
                if(!errStatusCode && view) callback(200,view,'html');
                else callback(errStatusCode, undefined, 'html')
            })
        } else {
            callback(302, undefined, undefined, {
                Location: `${config.domain}/login`
            });
        }
    } else {
        callback(405, undefined, 'html');
    }
};

module.exports = profileController;