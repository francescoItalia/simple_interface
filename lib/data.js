/***********************************
*  CRUD Library to work with data 
************************************/
const fs = require('fs');
const path = require('path');

// Instantiate the data object
const data = {};

// Current directory
const baseDir = path.join(__dirname, '../data');

// Create Data
data.create = (dir, fileName, dataObj, callback) => {
  // Open the file for writing
  fs.open(`${baseDir}/${dir}/${fileName}.json`, 'wx', (err, fd) => {
    if (!err && fd) {
      // Write to the file
      fs.write(fd, dataObj, err => {
        if (!err) {
          // Close the file
          fs.close(fd, err => {
            if (!err) {
              callback(false);
            } else {
              callback('Error');
              myLogger('Internal error',
              `Error closing the file after writing. 
               data: ${JSON.stringify(dataObj)},
               error message: ${err.message}`);
            }
          });
        } else {
          callback('Error');
          myLogger('Internal error',
          `Error Writing to the file. 
           data: ${JSON.stringify(dataObj)},
           error message: ${err.message}`);
        }
      });
    } else {
      callback('Error Opening the file. It might already exist');
    }
  });
};

// Read Data
data.read = (dir, fileName, callback) => {
  // Open the file for reading
  fs.readFile(`${baseDir}/${dir}/${fileName}.json`, 'utf8', (err, data) => {
    if (!err && data) {
      callback(false, JSON.parse(data));
    } else {
      callback('Could not find the file');
    }
  });
};

// Update Data
data.update = (dir, fileName, dataObj, callback) => {
  const filePath = `${baseDir}/${dir}/${fileName}.json`;
  // remove conteent of the file
  fs.truncate(filePath, (err) => {
    if (!err) {
      // Open the file for writing
      fs.writeFile(filePath, dataObj, { flag: 'r+' }, (err) => {
        if (!err) {
          callback(false);
        } else {
          callback('Error writing to the file. It might not exist');
        }
      })
    } else {
      callback('Error');
      myLogger('Internal error',
      `Error trunkating the file. 
       data: ${JSON.stringify(dataObj)}
       error message: ${err.message}`);
    }
  })
}

// Delete Data
data.delete = (dir, fileName, callback) => {
  // Unlink (deleted) a file
  fs.unlink(`${baseDir}/${dir}/${fileName}.json`, err => {
    if (!err) {
      callback(false);
    } else {
      callback('Error Deleting the file');
    }
  });
};

module.exports = data;
