const { MongoClient, WriteError, ObjectId } = require("mongodb");
const { DatabaseError } = require('./DatabaseError');
const validateUtils = require('../helperMethods/validateUtilsChatModel');
const {InvalidInputError} = require("./InvalidInputError");
const logger = require("../logs/logger.js");
let db;
let client;
let chatCollection;
let collectionCursor;
let collectionArray;
let database;

/**
 * Connects to mongodb database and creates a collection if one doesn't already exist
 * @param {*} dbName The name of the database.
 * @param {*} url The url to the mongodb.
 * @throws Database error if there was an issue connecting to the database
 */
async function initialize(url, dbName, reset = false) {
  try{
      client = new MongoClient(url);
      database = dbName;
      await client.connect();
      logger.info("connected to db");
      db = client.db(dbName);
      
      collectionCursor = await db.listCollections({name: "Chats" });
      collectionArray = await collectionCursor.toArray();

      if(collectionArray.length == 0) {
          const collation = {locale: "en", strength: 1}
          await db.createCollection("Chats", {collation: collation});
      }
      else {
          if(reset) {
              db.collection("Chats").drop();

              const collation = {locale: "en", strength: 1}
              await db.createCollection("Chats", {collation: collation});
            }
    }

      chatCollection = db.collection("Chats");
  } catch(err) {
      logger.error("Could not initialize db: " + err.message);
      throw new DatabaseError("Could not initialize db: " + err.message);
  }
}

/** Adds chat to the database with a userSenderId and userRecipientId. 
 * @param {*} userSenderId of chat.
 * @param {*} userRecipientId of chat.
 * @throws InvalidInputError if userSenderId or userRecipientId is not in Users collection.
 */
async function addChat(userSenderId, userRecipientId){
  try {  
    if (!userSenderId || !userRecipientId) {
        throw new InvalidInputError('Sender and Receiver IDs must be provided.');
    }
    if(await validateUtils.isValid(userSenderId, userRecipientId)){
        const chat = await chatCollection.insertOne({ userSenderId, userRecipientId }); 
        logger.info(`Added chat: userSenderId: ${userSenderId} userRecipientId: ${userRecipientId}`);
        return chat;
    }
    else {
        throw new InvalidInputError(`Invalid sender or recipient Id. Passed userSenderId: ${userSenderId} userRecipientId: ${userRecipientId}`);
    }
  } catch(err) {
    if(err instanceof InvalidInputError){
        logger.error(`Invalid input: ${err.message}`);
        throw new InvalidInputError(err.message);
    } else {
        logger.error(`Database error: ${err.message}`);
        throw new DatabaseError(err.message);
    }  
  }
}


/**
 * Gets all the chats in the database.
 * @returns Array containing all the chats in the database.
 */
async function getAllChats() {
    try{
        let chats = await chatCollection.find().toArray();
        
        if(!chats || chats.length == 0){
            throw new InvalidInputError("Error! Unable to find any chats in the " + database + " database.")
        }
        
        let arr = await chats;
        return arr;
    }
    catch(err){
        if(err instanceof InvalidInputError){
            logger.error("Error! There was an error in the getAllChats method while trying to get all chats from the " + database + " database");
            throw new InvalidInputError(err.message);
        }
        else{
            logger.error(`Database error: ${err.message}`);
            throw new DatabaseError(err.message);
        }
    }
}

/**
 * Gets a single chat from the database.
 * @param {*} id of Chat.
 * @returns found chat object.
 */
async function getSingleChat(id){
  try{
      let object_id = new ObjectId(id);
      const chat = await chatCollection.findOne({ _id: object_id  });
        if(!chat){
            throw new InvalidInputError(`Provided chat not found in database: Id: ${id}`);
        }
        return chat;   
  }
  catch(err){
    if(err instanceof InvalidInputError){
        logger.error(`Invalid input: ${err.message}`);
        throw new InvalidInputError(err.message);
      } else {
        logger.error(`Database error: ${err.message}`);
        throw new DatabaseError(err.message);
      }
  }
}

/**
 * Deletes a chat from the database.
 * @param {*} id of Chat.
 * @returns deletedChat object.
 */
async function deleteChat(id) {
  try {
        
      let object_id = new ObjectId(id);
      let deletedChat = await chatCollection.deleteOne({ _id: object_id });
      if(deletedChat.deletedCount <= 0){
        throw new InvalidInputError(`Provided chat not found in database: Id: ${id}`);
      }

      return deletedChat;
    } catch (err) {
    if(err instanceof InvalidInputError){
        logger.error(`Invalid input: ${err.message}`);
        throw new InvalidInputError(err.message);
      } else {
        logger.error(`Database error: ${err.message}`);
        throw new DatabaseError(err.message);
      }
  }
}

async function getChatsBySenderId(senderId) {
    try {
        let chats = await chatCollection
            .find({userSenderId: senderId})
            .toArray();

        if(chats.length == 0)
        {
          throw new InvalidInputError("Could not find chats with sender id: " + senderId);
        }

        return chats;
    }
    catch(err) {
        if(err instanceof InvalidInputError){
            logger.error(`Invalid input: ${err.message}`);
            throw new InvalidInputError(err.message);
          } else {
            logger.error(`Database error: ${err.message}`);
            throw new DatabaseError(err.message);
          }
    }
}

/**
 * Closes the mock database.
 */
async function close() {
  try{
      await client.close();
      logger.info("Database connection closed");
  }
  catch(err){
      logger.error("Error closing database connection: " + err.message);
      throw new DatabaseError("Error! There was a problem closing the database. " + err.message);
  }
}

/**
 * Gets the Chats collection.
 * @returns Chats collection.
 */
function getCollection(){
  return chatCollection;
}

module.exports = {initialize, addChat, getSingleChat, deleteChat, close, getCollection, getAllChats, getChatsBySenderId};

