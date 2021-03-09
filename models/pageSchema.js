/*********** Dependencies ************/
const myLogger = require('../util/logger');
const path = require('path');
const fs = require('fs');

class PageSchema {
    // A function to get a specific html template
    getTemplate = (viewName, viewContentData, callback) => {
        // Validate arguments
        viewName = typeof viewName === 'string' && viewName.length > 0 ? viewName : '';
        viewContentData = typeof viewContentData === 'object' && viewContentData !== null ? viewContentData : {};
        if (viewName && viewContentData) {
            // Lookup the requested template
            const pathName = path.join(__dirname, '../views');
            fs.readFile(`${pathName}/${viewName}.html`, 'utf8', (err, viewString) => {
                if (!err && viewString) {
                    // Interpolate the string
                    const finalViewString = this.interpolate(
                        viewString,
                        viewContentData
                    );
                    callback(false, finalViewString);
                } else {
                    callback('Error');
                    myLogger('Internal error',
                    `The template could not be found. 
                     viewName: ${JSON.stringify(viewName)},
                     viewContendData: ${JSON.stringify(viewContentData)},
                     error message: ${err.message}`);
                }
            });
        } else {
            callback('Error');
            myLogger('Internal error',
            `A valid Template or contend Data were not specified. 
             viewName: ${JSON.stringify(viewName)},
             viewContendData: ${JSON.stringify(viewContentData)}`);
        }
    };

    // A function to add global templates to a given template
    addGlobaltemplates = (viewString, viewContentData, callback) => {
        // Validate arguments
        viewString = typeof viewString === 'string' && viewString.length > 0 ? viewString : '';
        viewContentData = typeof viewContentData === 'object' && viewContentData !== null ? viewContentData : {};
    
        if (viewString && viewContentData) {
            // Get the header
            this.getTemplate('_header', viewContentData, (err, headerString) => {
                if (!err && headerString) {
                    // Get the footer
                    this.getTemplate('_footer', viewContentData, (err, footerString) => {
                        if (!err && footerString) {
                            const finalString = headerString + viewString + footerString;
                            callback(false, finalString);
                        } else {
                            callback('Error');
                            myLogger('Internal error',
                            `Could not fetch the footer. 
                             viewString: ${JSON.stringify(viewString)},
                             viewContendData: ${JSON.stringify(viewContentData)},
                             error message: ${err.message}`);
                        }
                    });
                } else {
                    callback('Error');
                    myLogger('Internal error',
                    `Could not fetch the header. 
                     viewString: ${JSON.stringify(viewString)},
                     viewContendData: ${JSON.stringify(viewContentData)},
                     error message: ${err.message}`);
                }
            });
        } else {
            callback('Error');
            myLogger('Internal error',
            `A valid viewString or viewContentData was not passed. 
             viewString: ${JSON.stringify(viewString)},
             viewContendData: ${JSON.stringify(viewContentData)}`);
        }
    };

    // A function to fill in page templates with page specific content
    interpolate = (viewString, templateDataObject) => {
        // Validate arguments
        viewString = typeof viewString === 'string' && viewString.length > 0 ? viewString : '';
        templateDataObject = typeof templateDataObject === 'object' && templateDataObject !== null ? templateDataObject : {};
    
        for (let keyName in templateDataObject) {
            if (
                templateDataObject.hasOwnProperty(keyName) &&
                typeof keyName === 'string'
            ) {
                const find = new RegExp(`{${keyName}}`, 'g');
                const replace = templateDataObject[keyName];
                viewString = viewString.replace(find, replace);
            }
        }
        return viewString;
    };
}

module.exports = PageSchema;



