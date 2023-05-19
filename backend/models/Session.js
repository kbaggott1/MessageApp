const uuid = require('uuid');

// Each session contains the username of the user and the time at which it expires
// This object can ba extended to store additional protected session information
class Session {
    constructor(username, expiresAt){
        this.username = username;
        this.expiresAt = expiresAt;
    }

    //We'll use this method later to determine if the session has expired
    isExpired() {
        this.expiresAt < (new Date())
    }
}

// This object stores the users sessions. For larger scale applications, you can
// use a database or cache for this purpose
const sessions = []

/**
 * Creates a session cookie for a given user. Session cookie is set to expire after
 * a number of minutes sepcified in the parameters.
 * @param {*} username The username of the user who's session is being created
 * @param {*} numMinutes The number of minutes in which the session cookie should expire
 * @returns The sessionId of the new session cookie
 */
function createSession(username, numMinutes){
    //Generate a random UUID as sessionId
    const sessionId = uuid.v4();

    // Set the expiry time as numMinutes (in miliseconds) after the current time
    const expiresAt = new Date(Date.now() + numMinutes * 60000);

    // Create a session object containing information about the user and expiry time
    const thisSession = new Session(username, expiresAt);

    // And the session information to the sessions map, using sessionId as the key
    sessions[sessionId] = thisSession;

    return sessionId;
}

/**
 * Gets a sessionm fro the list of currently valid sessions
 * @param {*} sessionId Session Id that will be searched for
 * @returns The Session with a matching sessionId
 */
function getSession(sessionId) {
    return sessions[sessionId];
}

/**
 * Deletes a session from the list of currently valid sessions
 * @param {*} sessionId The sessionId of the session you wish to delete
 */
function deleteSession(sessionId) {
    delete sessions[sessionId];
}

module.exports = { Session, createSession, getSession, deleteSession}