// @ts-nocheck
/*
 * Frontend Logic for the Application
 */

// Interface for making API calls
class App {
    static config = {
        'host': 'http://localhost:3000'
    };

    static request = (headersObject, path, method, queryStringObject, payload, callback) => {
        // Set Defaults
        headersObject = typeof (headersObject) === 'object' && headersObject !== null ? headersObject : {};
        path = typeof (path) === 'string' ? path : '/';
        method = typeof (method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
        queryStringObject = typeof (queryStringObject) === 'object' && queryStringObject !== null ? queryStringObject : {};
        payload = typeof (payload) === 'object' && payload !== null ? payload : {};
        callback = typeof (callback) === 'function' ? callback : false;
    
        // Instantiate the url object
        const requestUrl = new URL(path, App.config.host);
        // For each query string parameters sent, add it to the path
        for (let queryKey in queryStringObject) {
            if (queryStringObject.hasOwnProperty(queryKey)) {
                requestUrl.searchParams.append(queryKey, queryStringObject[queryKey])
            }
        }
    
        // Instantiate the headers object
        const headers = new Headers();
        // Make the request of JSON type
        headers.append('Content-Type', 'application/json');
        // For each header sent, add it to the header object
        for (let headerKey in headersObject) {
            if (headersObject.hasOwnProperty(headerKey)) {
                headers.append(headerKey, headersObject[headerKey])
            }
        }
    
        // if there is a current session token set, add it to the header
        // if (App.config.sessionToken) {
        //     headers.append('token', App.config.sessionToken.id);
        // }
    
        // If there is a payload try to stringify it
        let body;
        payload ? body = JSON.stringify(payload) : body = '';
    
        // Instantiate the request object
        const request = new Request(requestUrl, {
            method,
            path,
            headers,
            body
        });
    
        let responseStatus;
        // Send the request
        fetch(request)
            // Handle Response
            .then((res) => {
                responseStatus = res.status;
                return res.json();
            })
            .then((data) => {
                // Callback if requested
                if (callback) {
                    if (data) {
                        callback(responseStatus, data)
                    } else {
                        callback(responseStatus, false)
                    }
                }
            })
            .catch((e) => {
                console.log(e);
                throw new Error('Something went wrong!')
            })
    }
}

class Auth {
    // Set a cookie and save the token data to local storage
    static setSession = (tokenData) => {
        const tokenString = JSON.stringify(tokenData);
        // Set a cookie
        document.cookie = `token=${tokenString}; path="/"; expires=${new Date(tokenData.expires)}`
        // Persist to session storage
        sessionStorage.setItem('token', tokenString);
    }

    // Bind Logout buttons
    static bindLogoutButton = () => {
        const logOutButton = document.querySelector('.logout');

        // If there are logout buttons on page
        if (logOutButton) {
            // Check if there is an active Session
            const tokenStr = sessionStorage.getItem('token');

            // Try to parse the token to an object
            try {
                const tokenObj = JSON.parse(tokenStr)
                if (tokenObj) {
                    const queryStringObj = { 'tokenId': tokenObj.id }
                    logOutButton.addEventListener('click', () => {
                        App.request(undefined, 'user/logout', 'POST', queryStringObj, undefined, (statusCode) => {
                            if (statusCode === 200) {
                                // Redirect the User to the homepage
                                sessionStorage.clear();
                                window.location = '/'
                            } else {
                                console.log(statusCode);
                            }
                        })
                    })
                }
            } catch (e) {
                throw new Error('Could not find an active Session Token')
            }
        }
    }

    // Redirect to /my-profile if a valid session already exists
    static verifyToken = () => {
        // Check if there is an active Session
        const tokenStr = sessionStorage.getItem('token');
        if (tokenStr) {
                App.request(undefined, 'user/verifyToken', 'POST', undefined, undefined, (statusCode) => {
                if (statusCode === 200) {
                    if (window.location.pathname === '/login' || window.location.pathname === '/sign-up') {
                        window.location = '/my-page';
                    }
                }
            })
        }
    }
}

window.addEventListener('DOMContentLoaded',() => {
    Auth.verifyToken();
    Auth.bindLogoutButton();
});

