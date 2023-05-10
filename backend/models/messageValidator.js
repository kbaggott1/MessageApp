const validator = require("validator");
const { DatabaseError } = require("./DatabaseError");
const {InvalidInputError} = require("./InvalidInputError");
const { ObjectId } = require("mongodb");
const logger = require("../logs/logger");
const userModel = require("./userModel");
const chatModel = require("./chatModel");
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
 * Checks for a valid message, and the user id and chat id exists.
 * Does not return anything. Will throw if message or id is invalid.
 * @param {*} userCollection The collection to check for the user id.
 * @param {*} chatCollection The collection to check for the Chat id.
 * @param {*} message The content of the message to check.
 * @param {*} authorId The author id to verify exists.
 * @param {*} chatId The chat id to verify exists.
 * @throws InvalidInputError and DatabaseError
 */
async function checkValid(message, authorId, chatId) {
    try {
        checkMessage(message);
        await checkAuthorId(authorId);
        await checkChatId(chatId);
    }
    catch(err) {
        logger.error(err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else
            throw new DatabaseError(err.message);
    }
}


async function checkChatId(id) {
    try {
        id = new ObjectId(id);
        let chatId = await chatModel.getCollection().findOne({_id: id});

        if(chatId == null)
            throw new InvalidInputError("ChatId does not exist.")

        return false;
    }
    catch(err) {
        logger.error(err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else
            throw new DatabaseError("Database error trying to check chatId:"+ err.message);
    }
}

async function checkAuthorId(id) {
    try {
        console.log(id);
        id = new ObjectId(id);
        let authorId = await userModel.getCollection().findOne({_id: id});


        if(authorId == null)
            throw new InvalidInputError("AuthorId does not exist.")

        return false;
    }
    catch(err) {
        logger.error(err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else
            throw new DatabaseError("Database error trying to check authorId:"+ err.message);
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