/*************************************************************
 * PROFILE Routes
 *************************************************************/

/*********** Dependencies ************/
const profileController = require('../controllers/profile');

// Instantiate the handlers object
const profileRoutes = {};


// my-profile Handler
profileRoutes.profile = (reqData, callback) => profileController.profile(reqData, callback);

module.exports = profileRoutes;