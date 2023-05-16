const validator = require("validator");
const { DatabaseError } = require("./DatabaseError");
const {InvalidInputError} = require("./InvalidInputError");
const { ObjectId } = require("mongodb");
const logger = require("../logs/logger");
const userModel = require("./userModel");
const chatModel = require("./chatModel");
/**
 * Checks if message is valid. 
 * Does not return anything. Will throw if message is invalid or message does not exist.
 * @param {*} collection The collection for the messages.
 * @param {*} messageId The id of the message to verify it exists.
 * @param {*} message The message to validate.
 * @throws InvalidInputError and DatabaseError
 */
async function checkValidForEdit(collection, messageId, message) {
    try {
        await checkMessageId(collection, messageId);
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

async function checkMessageId(collection, messageId) {
    try {
        let message = await collection.findOne({_id: messageId})

        if(!message) 
            throw new InvalidInputError("Could not find message with id in validator: " + messageId);
    }
    catch (err) {
        logger.error(err.message);
        if(err instanceof InvalidInputError) {
            throw new InvalidInputError("Invalid input error in validator: " + err.message);
        }
        else 
            throw new DatabaseError("Database error in validator: " + err.message);
    }
}

/**
 * Checks for a valid message, and the user id and chat id exists.
 * Does not return anything. Will throw if message or id is invalid.
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