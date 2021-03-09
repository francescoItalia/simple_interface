/*************************************************************
 * STATIC Routes
 * Routes to serve static content
 *************************************************************/

/*********** Dependencies ************/
const staticController = require('../controllers/static');

// Instantiate the handlers object
const staticRoutes = {};

staticRoutes.ping = (reqData, callback) => {
  callback(200, {
    Status: `Server Ok`
  })
}

staticRoutes.home = (reqData, callback) => staticController.home(reqData, callback);

staticRoutes.signup = (reqData, callback) => staticController.signup(reqData, callback);

staticRoutes.login = (reqData, callback) => staticController.login(reqData, callback);

staticRoutes.forgotPassword = (reqData, callback) => staticController.forgotPassword(reqData, callback);

staticRoutes.resetPassword = (reqData, callback) => staticController.resetPassword(reqData, callback);

// // logout Handler
// staticRoutes.logout = (reqData, callback) => staticController.logout(reqData, callback);

// Public Resources Handler
staticRoutes.assets = (reqData, callback) => staticController.assets(reqData, callback);

staticRoutes.notFound = (reqData, callback) => staticController.notFound(reqData, callback);

module.exports = staticRoutes;