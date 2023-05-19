//const dbName = "pokemon_db";
const {MongoClient, WriteConcernError, WriteError, ObjectId} = require("mongodb");
const { InvalidInputError } = require('./InvalidInputError');
const { DatabaseError } = require('./DatabaseError');
const { checkValid, checkValidForEdit } = require("./messageValidator");
const logger = require("../logs/logger");
let client;
let messageCollection;

/**
 * Connects to mongodb database and creates a collection if one doesns't already exist
 * @param {*} dbName The name of the database.
 * @param {*} url The url to the mongodb.
 * @throws Database error if there was an issue connecting to the database
 */
async function initialize(dbName, url, reset = false) {
    try{
        client = new MongoClient(url);

        await client.connect();
        logger.info("connected to db");
        let db = client.db(dbName);
        
        let collectionCursor = await db.listCollections({name: "Messages" });
        let collectionArray = await collectionCursor.toArray();

        if(collectionArray.length == 0) {
            const collation = {locale: "en", strength: 1}
            await db.createCollection("Messages", {collation: collation});
        }
        else {
            if(reset) {
                db.collection("Messages").drop();

                const collation = {locale: "en", strength: 1}
                await db.createCollection("Messages", {collation: collation});
            }
        }

        messageCollection = db.collection("Messages");
    } catch(err) {
        logger.error("Could not initialize db: " + err.message);
        throw new DatabaseError("Could not initialize db: " + err.message);
    }
}

/**
 * Closes the database connection.
 */
async function close() {
    try {
        await client.close();
    }
    catch(err) {
        logger.error("Error closing database: " + err.message);
    }
}
/**
 * Adds a message to the messages collection
 * @param {*} messageBody The content of the message.
 * @param {*} authorId The author id of the message.
 * @param {*} chatId The chat id of the message.
 * @returns The message being added.
 * @throws InvalidInputError if messageId, message or user is not valid; Throws Database error.
 */
async function postMessage(messageBody, authorId, chatId) {
    try {
        await checkValid(messageBody, authorId, chatId);

        const date = new Date();

        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let hour = date.getHours();
        let minutes = date.getMinutes();

        let currentDate = day +"/"+month+"/"+year+" "+hour+":"+minutes;

        let message = {messageBody: messageBody, authorId: authorId, chatId: chatId, sentDate: currentDate};
        await messageCollection.insertOne(message);
        return message;
    }
    catch(err) {
        logger.error(err.message)
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);

        throw new DatabaseError(err.message);
        
    }
}


/**
 * Gets a specific message from the messages collection.
 * @param {*} messageId The messageId of the message to receive.
 * @returns A message object containing messageId, message, and user.
 * @throws InvalidInputError if message was not found in the database; Throws database error.
 */
async function getMessageById(messageId) {
    try {
        messageId = new ObjectId(messageId);
        let message = await messageCollection.findOne({_id: messageId});

        if(message == null)
            throw new InvalidInputError("Could not find message with id: " + messageId);

        return message;
    }
    catch(err) {
        logger.error("Could not get messageId in model: " + err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else 
            throw new DatabaseError(err.message)
    }
    
}

/**
 * Gets an array of all messages sent by a specified user.
 * @param {*} chatId The chatId of the messages to retrieve.
 * @returns An array of message objects all posted from the user specified.
 * @throws Database Error when messages by user could not be found
 */
async function getMessagesByChatId(chatId) {
    try {
        chatId = new ObjectId(chatId);
        let messages = await messageCollection
            .find({chatId: chatId}) //{chatId: chatId.toString()}
            .toArray();

        return messages;
    }
    catch(err) {
        logger.error("Could not get messages by chatId in model: " + err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else
            throw new DatabaseError(err.message);
    }
}


/**
 * Updates the content of a message.
 * @param {*} messageId The message id of the message to edit.
 * @param {*} newMessage The new message to replace the old one with.
 * @returns The new message content.
 * @throws InvalidInputError if messageId isn't in the database or the message is invalid; throws Database error.
 */
async function editMessage(messageId, newMessage) {
    try {
        messageId = new ObjectId(messageId);
        await checkValidForEdit(messageCollection, messageId, newMessage);
        //await messageCollection.updateOne({_id: messageId}, {$set: {messageBody: newMessage}});
        return await messageCollection.updateOne({_id: messageId}, {$set: {messageBody: newMessage}});
    }
    catch(err) {
        logger.error("Could not edit message in model: " + err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else
            throw new DatabaseError(err.message);
    }
}

/**
 * Deletes a specified message from the collection. If id doesn't exist nothing will be deleted.
 * @param {*} id The id of the message to delete.
 * @throws DatabaseError if message could not be deleted.
 */
async function deleteMessageById(id) {
    try {
        id = new ObjectId(id);
        await messageCollection.deleteOne({_id: id});
    }
    catch(err) {
        logger.error("Could not delete message in model: " + err.message);
        if(err instanceof WriteError)
            throw new DatabaseError(err.message);

        if(err instanceof WriteConcernError)
            throw new DatabaseError(err.message);

        throw new DatabaseError(err.message);
    }
}

/**
 * Only use for testing.
 * @returns The messages collection.
 */
function getCollection() {
    return messageCollection;
}

module.exports = {
    initialize,
    postMessage,
    getMessageById,
    getMessagesByChatId,
    editMessage,
    deleteMessageById,
    close,
    getCollection

}