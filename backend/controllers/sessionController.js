const express = require("express");
const REFESHTIME = 10;
const { Session, createSession, getSession, deleteSession } = require("../models/Session.js");
const { checkCredentials } = require("../models/userModel.js");
const router = express.Router();
const routeRoot = '/session';

/** Log a user in and create a session cookie that will expire in 2 minutes */
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

    return {sessionId, userSession};//Succesfully validated
}

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

    // Set the session cookie to the new id we genrated, with a
    // renewed expiration time
    response.cookie("sessionId", newSessionId, { expires: getSession(newSessionId).expiresAt, httpOnly: true });
    //response.sendStatus(200);
    return newSessionId;
}


module.exports = { router, routeRoot, loginUser, authenticateUser, refreshSession };