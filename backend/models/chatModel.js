const dbName = "Chats";
//const dbNameTest = "pokemon_db_test";
let mongod;
const { MongoClient, Long } = require("mongodb");
const validateUtils = require("./validateUtilsChatModel");
const {DatabaseError} = require("./DatabaseError");
const {InvalidInputError} = require("./InvalidInputError");
const pino = require('pino')
const logger = pino();
let client;
let chatsCollection;


/**
 * Connect up to the online MongoDb database with the name and url passed in by the user. If reset is true, recreates database.
 * @param {*} dbName Name of MongoDB database.
 * @param {*} reset Drops and recreates database if true.
 * @param {*} url Client url to connect to.
 */
async function initialize(url, dbName, reset) {
    try {
      client = new MongoClient(url); // store connected client for use while the app is running
      await client.connect(); 
      logger.info("Connected to MongoDb");
      let db = client.db(dbName);
      const chatsCollection = db.collection("Chats");

      if(reset){
        await chatsCollection.drop();
      }
      
      // Check to see if the chats collection exists
      const collectionCursor = await db.listCollections({ name: "Chats" });
      const collectionArray = await collectionCursor.toArray();
      if (collectionArray.length == 0) {  
      // collation specifying case-insensitive collection
      const collation = { locale: "en", strength: 1 };
      // No match was found, so create new collection
      await db.createCollection("Chats", { collation: collation });
      }    
    } 
    catch (err) {
    logger.error(err.message);
    throw new DatabaseError(err.message);
    }
}

/**
 * Adds chat to the MongoDB database if name and type is valid. Throws a DatabaseError exception if invalid pokemon was passed.
 * @param {*} id of chat.
 * @param {*} userSenderId of chat.
 * @param {*} userRecipientId of chat.
 */
async function addChat(id, userSenderId, userRecipientId){
    try{  
            if(validateUtils.isValid2(id, userSenderId, userRecipientId)){
              const db = client.db(dbName);
              const chatsCollection = db.collection("Chats")
              const chat = await chatsCollection.insertOne({ id, userSenderId, userRecipientId }); 
              return chat;
            }
            else {
              throw new InvalidInputError("Name is required and has to be alpha, type cannot be anything else than Normal, Grass, Fire, Water, Electric and Psychic..");
            }
    }
    catch(err){
      throw new InvalidInputError(err.message);
    }

}

/**
 * Closes the connection to the MongoDB database.
 */
async function close() {
  try {
    await client.close();
    console.log("MongoDb connection closed");
  } catch (err) {
    console.log(err.message);
  }
}

/**
 * Finds the chats with the provided name in the database. Throws DatabaseError exception if the chat was not found in the database.
 * @param {*} name Name of the chat.
 * @returns 
 */
async function getSingleChat(id, userSenderId, userRecipientId){
  try{
    const db = client.db(dbName);
    chatsCollection = db.collection("Chats");
    let chat = await chatsCollection.findOne({ id, userSenderId, userRecipientId });
    if(chat){
      console.log(chat);
      return chat; 
    }
    else{
      throw new DatabaseError("Chat not found in database: " + id + "" + userSenderId + "" + userRecipientId);
    }
  }
  catch(err){
    throw new DatabaseError(err.message);
  }
}

/**
 * Gets the list of all chats in the database collection and displays them in a table. Throws a DatabaseError exception if there are no chats in the database collection.
 */
async function getAllChats(){
  const db = client.db(dbName);
  chatsCollection = db.collection("Chats");
  try{
    const chatsArray = await chatsCollection.find().toArray();
    if(chatsArray.length != 0){
      console.table(chatsArray);
      return chatsArray;
    }
    else{
      logger.error(err.message);
      throw new DatabaseError(err.message);
    }
  }
  catch(err){
    logger.error(err.message);
    throw new DatabaseError(err.message);
  }
}

/**
 * Deletes chat from database. 
 * @param {*} username of user.
 * @param {*} accountType 
 * @returns True if chat was deleted. Throws a DatabaseError exception if chat not found in the database collection.
 */
async function deleteChat(id, userSenderId, userRecipientId) {
  const db = client.db(dbName);
  const chatsCollection = db.collection("users");
  const findChat = await chatsCollection.findOne({ id, userSenderId, userRecipientId });

  try {
    if (findChat) {
      const deletedUser = { id: id, userSenderId: userSenderId, userRecipientId: userRecipientId };
      await chatsCollection.deleteOne({ id, userSenderId, userRecipientId });
      return deletedUser;
    } else {
      throw new DatabaseError(`Provided chat not found in database: Id: ${id}, AccountType: ${accountType}`);
    }
  } catch (err) {
    logger.error(err.message);
    throw new DatabaseError(err.message);
  }
}

/**
 * Gets collection in the database.
 * @returns Collection in the database.
 */
function getCollection(){
  const db = client.db(dbName);
  return db.collection("Chats");
}
module.exports = {initialize, addChat, getSingleChat, getAllChats, close, getCollection, deleteChat};
  