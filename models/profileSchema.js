/*********** Dependencies ************/
const helpers = require('../util/helpers');
const _data = require('../lib/data');
const PageSchema = require('./pageSchema');

class ProfileSchema extends PageSchema {
    constructor(email) {
        super();
        this.email = helpers.validateEmail(email) ? email : false;
    }

    getView = callback => {
            // Get the user data
            _data.read('users', this.email, (err, userData) => {
                if (!err && userData) {
                    // Get login template data
                    _data.read('content', 'myprofile', (err, contentData) => {
                        if (!err && contentData) {
                            // Combine user data and Page data in one object
                            const fullPageData = {
                                ...contentData,
                                ...userData
                            };
                            this.getTemplate('myprofile', fullPageData, (err, templateString) => {
                                if (!err && templateString) {
                                    // Add global templates
                                    this.addGlobaltemplates(templateString, fullPageData, (err, finalString) => {
                                        if (!err && finalString) {
                                            callback(false, finalString);
                                        } else {
                                            callback(500);
                                        }
                                    });
                                } else {
                                    callback(500);
                                }
                            });
                        } else {
                            callback(500);
                        }
                    });
                } else {
                    callback(500);
                }
            })
    }
}

module.exports = ProfileSchema;



