/*********** Dependencies ************/
const _data = require('../lib/data');
const PageSchema = require('./pageSchema');

class StaticPageSchema extends PageSchema {
    constructor(viewName) {
        super();
        this.viewName = viewName;
    }

    getView = callback => {
        // Get signin template data
        _data.read('content', this.viewName, (err, viewContentData) => {
            if (!err && viewContentData) {
                this.getTemplate(this.viewName, viewContentData, (err, viewString) => {
                    if (!err && viewString) {
                        // Add global templates
                        this.addGlobaltemplates(viewString, viewContentData, (err, finalViewString) => {
                            if (!err && finalViewString) {
                                callback(false, finalViewString);
                            } else {
                                callback(500);
                            }
                        });
                    } else {
                        callback(500);
                    }
                });
            } else {
                console.log(err);
                callback(500);
            }
        });
    }
}

module.exports = StaticPageSchema;



