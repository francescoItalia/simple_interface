/* Dependencies */
const http = require('http');
const { StringDecoder } = require('string_decoder');
const helpers = require('./util/helpers');
const config = require('./config');

// Routes
const userRoutes = require('./routes/user');
const sessionRoutes = require('./routes/session');
const profileRoute = require('./routes/profile');
const staticPageRoutes = require('./routes/static');

// Globals
const decoder = new StringDecoder('utf8');
const domain = config.domain;

class Server {
  handleReq(req, res) {
    // Get the url from the incoming req Object
    const reqUrl = new URL(domain + req.url);

    // Get the path
    const path = reqUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/, '');

    // Get the method
    const method = req.method.toLowerCase();

    // Get the headers
    const headers = req.headers;

    // Instantiate the reqObject
    const reqData = {
      path: trimmedPath,
      method: method,
      headers: headers,
      searchParams: reqUrl.searchParams,
      user: req.user
    };

    // Buffer for incoming data storing
    let buffer = '';

    // Listen for incoming data
    req.on('data', data => {
      buffer += decoder.write(data);
    });

    req.on('end', data => {
      buffer += decoder.end(data);

      // Add req payload to the req object
      reqData.payload = helpers.parseJsonToObject(buffer);

      // Figure out which path was requested
      let chosenHandler =
        typeof router[reqData.path] !== 'undefined' ?
          router[reqData.path] :
          staticPageRoutes.notFound;

      // Figure out if the request is for a assets resource
      chosenHandler = reqData.path.indexOf('assets/') > -1 ? staticPageRoutes.assets : chosenHandler;

      chosenHandler(reqData, (statusCode, payload, contentType, headersObj = {}) => {
        statusCode = typeof statusCode === 'number' ? statusCode : 200;
        contentType = typeof contentType === 'string' ? contentType : 'json';
        headersObj = typeof headersObj === 'object' ? headersObj : {};

        // Return the response parts that are content specific
        let stringPayload = '';
        if (contentType === 'json') {
          res.setHeader('Content-Type', 'application/json');
          payload = typeof payload === 'object' && payload !== null ? payload : {};
          stringPayload = JSON.stringify(payload);
        }
        if (contentType === 'html') {
          res.setHeader('Content-Type', 'text/html; charset=UTF-8');
          stringPayload = typeof payload === 'string' ? payload : '';
        }
        if (contentType === 'css') {
          res.setHeader('Content-Type', 'text/css');
          stringPayload = typeof payload !== 'undefined' ? payload : '';
        }
        if (contentType === 'js') {
          res.setHeader('Content-Type', 'text/javascript');
          stringPayload = typeof payload !== 'undefined' ? payload : '';
        }
        if (contentType === 'jpg') {
          res.setHeader('Content-Type', 'image/jpg');
          stringPayload = typeof payload !== 'undefined' ? payload : '';
        }
        if (contentType === 'png') {
          res.setHeader('Content-Type', 'image/png');
          stringPayload = typeof payload !== 'undefined' ? payload : '';
        }
        // Return the global response parts
        res.writeHead(statusCode, headersObj);
        res.end(stringPayload);
      });
    });

  }

  // This method takes a variable number of parameters and a callback last
  go = (...args) => {
    // Invoke the callback passing the parameters provided
    args[args.length - 1].apply(this, args.slice(0, -1))
  }

  createServer = () => {
    this.server = http.createServer((req, res) => {
      this.go(req, res, this.handleReq)
    });
  }

  listen(port, callback) {
    this.server.listen(port, () => {
      // If provided run the callback
      callback && callback();
    })
  }

  // This method takes a middleware function. It redefine the 'go' method above
  // to a self invoked function that takes the previous 'go' function as parameter 
  // (before it is redefined) and return a new function. 
  // The new function returned becomes the new 'go' function which keeps in memory 
  // the previous 'go' function passed which will be invoked when the actual 'go'
  // function is invoked.
  // This method does not execute the actual middleware function that is passed,
  // it simply chains it to the 'go' function an it keeps chaining as many middlewares
  // are passed using the 'use' function
  use(fn) {
    this.go = (stack => (...args) => stack(...args.slice(0, -1), () => {
      fn.call(this, ...args.slice(0, -1), args[args.length - 1]
        .bind(this, ...args.slice(0, -1)))
    }))(this.go)
  }
}

// Instantiate req router object
const router = {
  'ping': staticPageRoutes.ping,
  '': staticPageRoutes.home,
  'login': staticPageRoutes.login,
  'signup': staticPageRoutes.signup,
  'reset-password': staticPageRoutes.resetPassword,
  'forgot-password': staticPageRoutes.forgotPassword,
  'assets': staticPageRoutes.assets,
  'my-profile': profileRoute.profile,
  'user/login': sessionRoutes.login,
  'user/logout': sessionRoutes.logout,
  'user/signup': userRoutes.signup,
  'user/update': userRoutes.update,
  'user/delete': userRoutes.delete,
  'user/send-recover-email': userRoutes.sendResetPasswordEmail,
  'user/reset-password': userRoutes.resetPassword,
  'user/verifyToken': userRoutes.verifyToken,
  'notFound': staticPageRoutes.notFound
};

module.exports = Server;