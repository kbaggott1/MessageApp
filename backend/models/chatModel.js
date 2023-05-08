const { MongoClient, WriteError } = require("mongodb");
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
  try{  
      if(validateUtils.isValid(userSenderId, userRecipientId)){
          const chat = await chatCollection.insertOne({ userSenderId, userRecipientId }); 
          logger.info(`Added chat: userSenderId: ${userSenderId} userRecipientId: ${userRecipientId}`);
          return chat;
      }
      else {
        throw new InvalidInputError(`Invalid sender or recipient Id. Passed userSenderId: ${userSenderId} userRecipientId: ${userRecipientId}`);
      }
  }
  catch(err){
      logger.error(`Error adding chat: ${err.message}`);
      throw new InvalidInputError(err.message);
  }
}


/**
 * Gets all the chats in the database.
 * @returns Array containing all the chats in the database.
 */
async function getAllChats() {
    try{
        let chats = await chatCollection.find();
        
        if(chats == null){
            throw new DatabaseError("Error! Unable to find any users in the " + database + " database.")
        }
        
        let arr = await chats.toArray();
        return arr;
    }
    catch(err){
        if(err instanceof DatabaseError){
            logger.error("Error! There was an error in the getAllChats method while trying to get all users from the " + database + " database");
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
      const chat = await chatCollection.findOne({ _id: id });
      if(chat){
          logger.info(`Retrieved chat: Id: ${id}`);
          return chat; 
      }
      else{
          throw new InvalidInputError(`Provided chat not found in database: Id: ${id}`);
      }
  }
  catch(err){
      logger.error(`Error retrieving chat: ${err.message}`);
      throw new InvalidInputError(err.message);
  }
}

/**
 * Deletes a chat from the database.
 * @param {*} id of Chat.
 * @returns deletedChat object.
 */
async function deleteChat(id) {
  try {
      const findChat = await chatCollection.findOne({ _id: id });
      if (findChat) {
          const deletedChat = { _id: id };
          await chatCollection.deleteOne({ _id: id });
          logger.info(`Deleted chat: Id: ${id}`);
          return deletedChat;
      } else {
          throw new InvalidInputError(`Provided chat not found in database: Id: ${id}`);
      }
  } catch (err) {
      logger.error(`Error deleting chat: ${err.message}`);
      throw new InvalidInputError(err.message);
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

module.exports =  {initialize, addChat, getSingleChat, deleteChat, close, getCollection, getAllChats};
