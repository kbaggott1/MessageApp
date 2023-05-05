const { MongoClient, WriteError } = require("mongodb");
const { DatabaseError } = require('./DatabaseError');
const validateUtils = require('./validateUtilsChatModel');
const {InvalidInputError} = require("./InvalidInputError");
const logger = require("../logs/logger.js");
const DBError = require("./DatabaseError.js");
let dbName;
let mongoClient;
let chatCollection;

/**
 * Connects to mongodb database and creates a collection if one doesn't already exist
 * @param {*} dbName The name of the database.
 * @param {*} url The url to the mongodb.
 * @throws Database error if there was an issue connecting to the database
 */
async function initialize(url, dbName, reset = false) {
  try{
      //const url = process.env.URL_PRE + process.env.MONGODB_PWD + process.env.URL_POST;
      client = new MongoClient(url);

      await client.connect();
      logger.info("connected to db");
      let db = client.db(dbName);
      
      let collectionCursor = await db.listCollections({name: "Chats" });
      let collectionArray = await collectionCursor.toArray();

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
 * Adds chat to the MongoDB database if name and type is valid. Throws a DatabaseError exception if invalid chat was passed.
 * @param {*} userSenderId of chat.
 * @param {*} userRecipientId of chat.
 */
async function addChat(id, userSenderId, userRecipientId){
  try{  
      if(validateUtils.isValid2(userSenderId, userRecipientId)){
          const chat = await chatCollection.insertOne({ _id: id, userSenderId, userRecipientId }); 
          logger.info(`Added chat: Id: ${id} userSenderId: ${userSenderId} userRecipientId: ${userRecipientId}`);
          return chat;
      }
      else {
        throw new InvalidInputError("Invalid sender or recipient Id.");
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
      let chat = await chatCollection.findOne({ _id: id });
      if(chat){
          logger.info(`Retrieved chat: ${id}`);
          return chat; 
      }
      else{
          throw new DatabaseError(`Chat not found in database: Id: ${id}`);
      }
  }
  catch(err){
      logger.error(`Error retrieving chat: ${err.message}`);
      throw new DatabaseError(err.message);
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
          throw new DatabaseError(`Provided chat not found in database: Id: ${id}`);
      }
  } catch (err) {
      logger.error(`Error deleting chat: ${err.message}`);
      throw new DatabaseError(err.message);
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
