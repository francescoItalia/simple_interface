/*************************************************************
 * SESSION ROUTES
 *************************************************************/

/*********** Dependencies ************/
const sessionControllers = require('../controllers/session');

// Instantiate the session handlers object
const sessionRoutes = {};

sessionRoutes.login = (reqData, callback) => sessionControllers.createSession(reqData, callback);

sessionRoutes.logout = (reqData, callback) => sessionControllers.destroySession(reqData, callback);


module.exports = sessionRoutes;