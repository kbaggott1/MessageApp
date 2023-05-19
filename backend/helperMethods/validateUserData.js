const validator = require('validator');
const logger = require("../logs/logger.js");

/**
 * Validates if the username is valid and if the password is not a null, an empty string or undefined.
 * In the event either the username or the password is invalid false is returned. It's important to note 
 * that you cannot know which (or if both) were invalid. This can cause headaches when debugging.
 * @param {*} username Username that will be validated
 * @param {*} password password that will be validated
 * @param {*} status status that will be validated
 * @param {*} firstName first name that will be validated
 * @param {*} lastName last name that will be validated
 * @param {*} biography biography that will be validated
 * @returns True if both the username, password, status, first name, last name and biography are valid, false otherwise
 */
async function isValidForAdd(collection, username, password, status, firstName, lastName, biography) {
    if(username === undefined || username === null || username === "" || username.length < 3 || username.length > 30) {
        logger.error("User being added had an Invalid username " + username);
        return false;
    }

    if(password === undefined || password === null || password === "" || password.length < 8) {
        logger.error("User being added had an Invalid password " + password);
        return false;
    }

    if(status === undefined || status === null ){
        if(status !== "online" && status !== "offline" && status !== "away"){
            logger.error("User status added has an invalid status " + status)
            return false;
        }
    }

    if(firstName === undefined || firstName === null || firstName === "" || validator.isAlpha(firstName) === false){
        logger.error("User being added has an invalid first name " + firstName);
        return false;
    }

    if(lastName === undefined || lastName === null || lastName === "" || validator.isAlpha(lastName) === false){
        logger.error("User being added has an invalid last name " + lastName);
        return false;
    }
    
    if(biography === undefined || biography === null || biography === ""){
        logger.error("User being added has an invalid biography " + biography);
        return false;
    }

    let user = await collection.findOne({username: username});
    if(user) {
        logger.error("User being added has a username that is already taken: " + username);
        return false;
    }

    return true;
}


/**
 * Validates if the username is valid and if the password is not a null, an empty string or undefined.
 * In the event either the username or the password is invalid false is returned. It's important to note 
 * that you cannot know which (or if both) were invalid. This can cause headaches when debugging.
 * @param {*} username Username that will be validated
 * @param {*} password password that will be validated
 * @param {*} status status that will be validated
 * @param {*} firstName first name that will be validated
 * @param {*} lastName last name that will be validated
 * @param {*} biography biography that will be validated
 * @returns True if both the username, password, status, first name, last name and biography are valid, false otherwise
 */
function isValidForEdit(username, password, status, firstName, lastName, biography) {
    if(username === undefined || username === null || username === "" || username.length < 3) {
        logger.error("User being added had an Invalid username " + username);
        return false;
    }

    if(password === undefined || password === null || password === "" || password.length < 6) {
        logger.error("User being added had an Invalid password " + password);
        return false;
    }

    if(status === undefined || status === null ){
        if(status !== "online" && status !== "offline" && status !== "away"){
            logger.error("User status added has an invalid status " + status)
            return false;
        }
    }

    if(firstName === undefined || firstName === null || firstName === "" || validator.isAlpha(firstName) === false){
        logger.error("User being added has an invalid first name " + firstName);
        return false;
    }

    if(lastName === undefined || lastName === null || lastName === "" || validator.isAlpha(lastName) === false){
        logger.error("User being added has an invalid last name " + lastName);
        return false;
    }
    
    if(biography === undefined || biography === null || biography === ""){
        logger.error("User being added has an invalid biography " + biography);
        return false;
    }

    return true;
}
module.exports = { isValidForAdd, isValidForEdit };