/* Configuration file for the server */

const gmailAuth = require('./gmailAuth');

const config = {
  'port': 3000,
  'domain': 'http://localhost:3000',
  'secret': 'doNotTryAndBendTheSpoon',
  'gmailAuth': {
    user: gmailAuth.user,
    pass: gmailAuth.pass
  },
  'errors': {
    '_400': {
      'Error': 'Required fields not provided or are incorrect'
    },
    '_401': {
      'Error': 'Not authenticated'
    },
    '_403': {
      'Error': "You don't have permission to access this resource"
    },
    '_404': {
      'Error': 'Requested resource not found'
    },
    '_405': {
      'Error': 'Method not allowed'
    },
    '_500': {
      'Error': 'Internal error. Something went wrong with your request'
    }
  }
};

module.exports = config;