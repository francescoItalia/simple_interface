const fs = require('fs')
const path = require('path')
const helpers = require('./helpers');


const myLogger = (errLevel, stringData) => {
    // Get current date and format
    const formattedDate = helpers.formatDate(new Date(Date.now()), 'yyyy-mm-dd');

    // Current directory
    const loggerPath = path.join(__dirname, `../log/app-${formattedDate}.log`);

    // Open the file for writing
    fs.open(loggerPath, 'a+', (err, fd) => {
        if (!err && fd) {
            const date = new Date();
            // Check data type
            stringData = typeof stringData === 'string' ? stringData : JSON.stringify(stringData);
            // Format message
            const message = `${date.toLocaleTimeString()} [${errLevel}] - ${stringData}\n\n`;
            // Write to the file
            fs.write(fd, message, err => {
                if (!err) {
                    // Close the file
                    fs.close(fd, err => {
                        if (err) {
                            console.log(
                                `Logging Error - ${new Date().toDateString()}
                                Message: Error closing the file after writing
                                Path: /util/logger.js
                            `);
                        }
                    });
                } else {
                    console.log(
                        `Logging Error - ${new Date().toDateString()}
                        Message: Error Writing to the file
                        Path: /util/logger.js
                        `);
                }
            });
        } else {
            console.log(
                `Logging Error - ${new Date().toDateString()}
                Message: Error Opening the file. It might already exist
                Path: /util/logger.js
                `);
        }
    });
};

module.exports = myLogger;