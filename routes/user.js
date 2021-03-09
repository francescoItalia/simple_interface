/*************************************************************
 * USER Routes
 *************************************************************/

/*********** Dependencies ************/
const { user } = require('../config/gmailAuth');
const userControllers = require('../controllers/user')

// Instantiate the user handlers Object
const userRoutes = {};

userRoutes.signup = (reqData, callback) => userControllers.create(reqData, callback);

userRoutes.profile = (reqData, callback) => userControllers.read(reqData, callback);

userRoutes.update = (reqData, callback) => userControllers.update(reqData, callback);

userRoutes.delete = (reqData, callback) => userControllers.delete(reqData, callback);

userRoutes.sendResetPasswordEmail = (reqData, callback) => userControllers.sendResetPasswordEmail(reqData, callback);

userRoutes.resetPassword = (reqData, callback) => userControllers.resetPassword(reqData, callback);

// If the user is authenticated
userRoutes.verifyToken = (reqData, callback) => {
    if (reqData.user) callback(200);
    else callback(401)
}

module.exports = userRoutes;