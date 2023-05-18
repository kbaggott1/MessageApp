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

function createSession(username, numMinutes){
    //Generate a random UUID as sessionId
    const sessionId = uuid.v4();

    // Set the expiry time as numMinutes (in miliseconds) after the current time
    const expiresAt = new Date(Date.now() + numMinutes * 6000);

    // Create a session object containing information about the user and expiry time
    const thisSession = new Session(username, expiresAt);

    // And the session information to the sessions map, using sessionId as the key
    sessions[sessionId] = thisSession;

    return sessionId;
}

function getSession(sessionId) {
    return sessions[sessionId];
}

function deleteSession(sessionId) {
    delete sessions[sessionId];
}

module.exports = { Session, createSession, getSession, deleteSession}