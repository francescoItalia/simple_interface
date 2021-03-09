/*************************************************************
 * MIDDLEWARES
 *************************************************************/

/*********** Dependencies ************/
const _data = require('../lib/data');
const helpers = require('../util/helpers');

const middlewares = {};

// A function to validate a token provided through cookies
middlewares.checkAuthentication = (req, res, next) => {
    // Get the token from the cookies if provided
    const token = helpers.getTokenFromCookies(req.headers.cookie);
    if (token) {
        const tokenId = typeof token.id === 'string' && token.id.length > 0 ? token.id : false;
        const email = helpers.validateEmail(token.email) ? token.email : false;
        if (tokenId && email) {
            // Lookup the token
            _data.read('session_tokens', tokenId, (err, tokenData) => {
                if (!err && tokenData) {
                    // Check tokenId / Email association & token expiration
                    if (tokenData.email === email && tokenData.validUntil > Date.now()) {
                        _data.read('users', email, (err, userData) => {
                            if (!err && userData) {
                                req.user = userData;
                                next();
                            } else {
                                next();
                            }
                        })
                    }
                } else next();
            });
        } else next();
    } else next();
};

module.exports = middlewares;