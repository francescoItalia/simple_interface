/* Dependencies */
const config = require('../config');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/* Various function helpers */

//Instantiate the helpers object
const helpers = {};

// A function to validate an email
helpers.validateEmail = email => {
  const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(String(email).toLowerCase());
};

// A function to validate strings like users' name and surname
helpers.validateString = str => {
  const reg = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
  if (reg.test(str)) return str;
  else return false;
}

// A function to validate string of a specific length
helpers.validateStringOfLen = (str,n) => {
  const regStr = `^[a-z0-9A-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð]{${n}}$`;
  const reg = new RegExp(regStr,"u");
  if (reg.test(str)) return true;
  else return false;
}

// A function to validate a password:
// Password between 7 to 15 characters 
// at least one numeric digit 
// at least one letter
// at least a special character
// test password: ase34d@
helpers.validatePassword = pw => {
  const re = /^^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{7,15}$/;
  return re.test(String(pw));
};

// A function to hash a string
helpers.hash = str => {
  const hashedStr = crypto
    .createHmac('sha256', config.secret)
    .update(str)
    .digest('hex');

  return hashedStr;
};

// A function to create a random mix of letters and number string
helpers.createRandomString = n => {
  const acceptedCharacters = 'abcdefghijklmnopqrstuvwzxy0123456789';
  let randomString = '';
  for (let i = 0; i < n; i++) {
    randomString += acceptedCharacters.charAt(
      Math.floor(Math.random() * acceptedCharacters.length)
    );
  }
  return randomString;
};

// Parse JSON Object without throwing in case of errors
helpers.parseJsonToObject = json => {
  try {
    const obj = JSON.parse(json);
    return obj;
  } catch {
    return {};
  }
};

// A function to fotmate dates
helpers.formatDate = (date, format) => {

  const map = {
    mm: date.getMonth() + 1,
    dd: date.getDate(),
    yy: date.getFullYear().toString().slice(-2),
    yyyy: date.getFullYear()
  }

  return format.replace(/mm|dd|yy|yyy/gi, matched => map[matched])
}

helpers.getStaticAsset = (asset, callback) => {
  asset = typeof asset === 'string' && asset.length > 0 ? asset : false;
  if (asset) {
    const pathName = path.join(__dirname, '../assets');
    fs.readFile(`${pathName}/${asset}`, (err, data) => {
      if (!err && data) {
        callback(false, data);
      } else {
        callback('Could not find specified asset');
      }
    });
  } else {
    callback('Asset Name provided not valid');
  }
};

helpers.parseCookiesToObject = (cookieString) => {
  try {
    const cookieArr = cookieString.split(';');
    const cookieObj = {};
    cookieArr.forEach(cookie => {
      const keyValue = cookie.split('=');
      cookieObj[keyValue[0]] = keyValue[1];
    })
    return cookieObj;
  } catch (e) {
    return false
  }
}

helpers.getTokenFromCookies = (cookieString) => {
  // Check if there are cookies
  cookieString = typeof cookieString === 'string' && cookieString.length > 0 ? cookieString : false;
  if (cookieString) {
    // Parse the cookies into an object
    const cookieObject = helpers.parseCookiesToObject(cookieString);
    // Check that a token was passed through cookies
    if (cookieObject.token) {
      // Try to parse the token
      const token = helpers.parseJsonToObject(cookieObject.token);
      if (token.id && token.email) {
        return token
      } else return false
    } else return false
  } else return false
}

module.exports = helpers;