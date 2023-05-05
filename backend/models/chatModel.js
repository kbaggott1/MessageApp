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

/**
 * Connects to mongodb database and creates a collection if one doesn't already exist
 * @param {*} dbName The name of the database.
 * @param {*} url The url to the mongodb.
 * @throws Database error if there was an issue connecting to the database
 */
async function initialize(url, dbName, reset = false) {
  try{
      client = new MongoClient(url);

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

/**
 * @param {*} userSenderId of chat.
 * @param {*} userRecipientId of chat.
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
 * 
 * @param {*} id 
 * @returns 
 */
async function getSingleChat(id){
  try{
      const chat = await chatCollection.findOne({ _id: id });
      if(chat){
          logger.info(`Retrieved chat: ${id}`);
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
 * 
 * @param {*} id 
 * @returns 
 */
async function deleteChat(id) {
  try {
      const findChat = await chatCollection.findOne({ _id: id });
      if (findChat) {
          const deletedChat = { _id: id };
          await chatCollection.deleteOne({ _id: id });
          logger.info(`Deleted chat: ${id}`);
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
 * 
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
 * 
 * @returns 
 */
function getCollection(){
  return chatCollection;
}

module.exports =  {initialize, addChat, getSingleChat, deleteChat, close, getCollection};
