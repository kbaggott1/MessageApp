const express = require("express");
const REFESHTIME = 10;
const { Session, createSession, getSession, deleteSession } = require("../models/Session.js");
const { checkCredentials } = require("../models/userModel.js");
const router = express.Router();
const routeRoot = '/session';

/**
 * Verifies the that the username and password provided through the request body parameters
 * exist and are linked to the same user. If the are valid a session cookie is returned to allow
 * the user to be signed in, other wise a status of 401 is returned will no cookie.
 * @param {*} request Request should contain username and password body parameters
 * @param {*} response Response will contain a status of 201 and a cookie if successful and 
 *                     a 401 status and not body if the login was a failure
 */
router.post('/login', loginUser);
async function loginUser(request, response) {
    const username = request.body.username;
    const password = request.body.password;

    if(username && password) {
        if(await checkCredentials(username, password)) {
            console.log("Successful login for user " + username);

            // Create a session object that will expire in 2 minutes
            const sessionId = await createSession(username, REFESHTIME);

            //Save cookie that will expire
            response.cookie("sessionId", sessionId, { expires: getSession(sessionId).expiresAt , httpOnly: true });
            response.sendStatus(200);
            return;
        }
        else {
            console.log("Unsuccessful login: invalid username / password given for user " + username + " with password " + password);
        }
    }
    else {
        console.log("Unsuccessful login: Empty username or password given");
    }

    response.sendStatus(401); // Redirect to main page (whether session was set or not)
    return;
}

/**
 * Logs out a user by deleting their session cookie. First, the methods verifies that the user has a
 * valid cookie. If they do not, a 401 status is returned. Otherwise the user's session cookie is
 * deleted and a status of 200 is returned.
 * @param {*} request Request should contain a valid session cookie.
 * @param {*} response Response will have a status of 200 if the logout was a success and the session 
 *                     cookie will be set to set to expire at the time of the request, deleting it.
 *                     If the request does contain a valid session cookie the response will be sent
 *                     back with a 401 status.
 */
router.get('/logout', logoutUser);
function logoutUser(request, response) {
    const authenticatedSession = authenticateUser(request);
    if(!authenticatedSession) {
        response.sendStatus(401);
        return;
    }
    deleteSession(authenticatedSession.sessionId);
    console.log("Logged out user " + authenticatedSession.userSession.username);

    // "erase" cookie by forcing it to expire
    response.cookie("sessionId", "", {expires: new Date(), httpOnly: true});
    response.sendStatus(200);
    return;
}

/**
 * Verifies that a request has a valid session cookie. Returns a status of 200 if the request
 * had a valid cookie. Returns 401 if it did not have a valid cookie.
 * @param {*} request The request who's session cookie is being verified
 * @param {*} response Response will contain a status of 200 if the request had a valid cookie
 *                     and a response of 401 if the request did not have a valid cookie
 */
router.get("/auth", authUser);
function authUser(request, response) {
  try {
    const authenticatedSession = authenticateUser(request);
    if (!authenticatedSession) {
      response.sendStatus(401);
    } else {
      response.sendStatus(200);
    }
  } catch (error) {
    response.sendStatus(401);
  }
}

/**
 * Authenticates a user. The request is checked for a valid session cookie. If the cookie is valid then
 * and object is returned contains the sessionId and userSession, otherwise null is returned.
 * @param {*} request The request that is authenticated. Needs to contain a valid session cookie in order
 *                    to be considered valid.
 * @returns Object containing SessionId and userSession if the request contained a valid session cookie.
 *          Otherwise null is returned.
 */
function authenticateUser(request) {
    // If this request doesn't have any cookies, that means it isn't authenticated. Return null
    if(!request.cookies) {
        return null;
    }

    // We can obtain the session token from the request cookies, which come with every request
    const sessionId = request.cookies['sessionId']
    if(!sessionId) {
        //if the cookie is not set return null
        return null;
    }

    //We then get the session of the user from the sessions map
    userSession = getSession(sessionId);
    if (!userSession) {
        return null;
    }

    // if the session has expired, delete the session from the and return null
    if(userSession.isExpired()) {
        deleteSession(sessionid);
        return null;
    }

    return {sessionId, userSession};//Successfully validated
}

/**
 * Refreshes a user session. Takes in a request and if the request has a valid session at the time
 * the method is run, the session time is reset. If the request does not contain a valid session
 * cookie the session is not refreshed and the response is given a 401 status and null us returned
 * @param {*} request A valid request contains a valid session cookie.
 * @param {*} response Response status will be 401 if the refresh failed. Otherwise it will contain
 *                     a status of 401
 * @returns newSessionId if the refresh was successful, a new cookie is added to the response. 
 *          If it failed null is returned and the response has it's status changed to 401.
 */
function refreshSession(request, response) {
    const authenticatedSession = authenticateUser(request);
    if (!authenticatedSession) {
        response.sendStatus(401); //Unauthorized access
        return null;
    }

    //Create and store a new Session object that will expire in 2 minutes
    const newSessionId = createSession(authenticatedSession.userSession.username, REFESHTIME);

    // Delete the old entry in the session map
    deleteSession(authenticatedSession.sessionId);

    // Set the session cookie to the new id we generated, with a
    // renewed expiration time
    response.cookie("sessionId", newSessionId, { expires: getSession(newSessionId).expiresAt, httpOnly: true });
    return newSessionId;
}

module.exports = { router, routeRoot, loginUser, authenticateUser, refreshSession };