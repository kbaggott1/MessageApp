const validator = require("validator");
const { DatabaseError } = require("./DatabaseError");
const {InvalidInputError} = require("./InvalidInputError");
const logger = require("../logger");

/**
 * Checks if id exists in the collection, and the message is valid. 
 * Does not return anything. Will throw if message or id is invalid.
 * @param {*} collection The collection to check for matching message id.
 * @param {*} id The id of the message to validate.
 * @param {*} message The message to validate.
 * @throws InvalidInputError and DatabaseError
 */
async function checkValidForEdit(collection, id, message) {
    try {
        if(!validator.isNumeric(id.toString()))
            throw new InvalidInputError("Invalid id: " + id + ". Ids must be numeric.");

        if((await isMessageIdUnique(collection, id)))
            throw new InvalidInputError("Message id: " + id + " does not exist.");

        checkMessage(message);
    }
    catch(err) {
        logger.error(err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else 
            throw new DatabaseError(err.message);
    }
}

/**
 * Checks for a unique message id, a valid message, and a valid username.
 * Does not return anything. Will throw if message or id is invalid.
 * @param {*} collection The collection to check for matching message id.
 * @param {*} id The message id to validate.
 * @param {*} message The message to validate.
 * @param {*} user The username to validate.
 * @throws InvalidInputError and DatabaseError
 */
async function checkValid(collection, message, authorId, chatId) {
    try {
        checkMessage(message);
        await checkAuthorId(collection, authorId);
        await chechChatId(collection, chatId);
    }
    catch(err) {
        logger.error(err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else
            throw new DatabaseError(err.message);
    }
}

async function checkAuthorId(collection, id) {
    try {
        let authorId = await collection.findOne({authorId: id});

        if(message == null)
            return true;

        return false;
    }
    catch(err) {

    }
}


/**
 * Checks for valid message. Message can't be empty or more than 500 characters.
 * @param {*} message The message to be validated.
 * @throws InvalidInputError
 */
function checkMessage(message) {
    const MAX_CHAR = 250;

    if(message.length == 0) {
        throw new InvalidInputError("Message cannot be empty");
    }

    if(message.length > MAX_CHAR) {
        throw new InvalidInputError("Message is over the character limit of " + MAX_CHAR);
    }
}



module.exports = {checkValid, checkValidForEdit};