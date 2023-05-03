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
let pokemonsCollection;


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
      db = client.db(dbName);
      const pokemonsCollection = db.collection("Chats");

      if(reset){
        await pokemonsCollection.drop();
      }
      
      // Check to see if the pokemons collection exists
      collectionCursor = await db.listCollections({ name: "Chats" });
      collectionArray = await collectionCursor.toArray();
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
              const chatCollection = db.collection("Chats")
              const chat = await chatCollection.insertOne({ id, userSenderId, userRecipientId }); 
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
 * Gets the list of all chats in the database collection and displays them in a table. Throws a DatabaseError exception if there are no pokemon in the database collection.
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

async function updateChat(oldName, oldType, newName, newType) {
  const db = client.db(dbName);
  const pokemonsCollection = db.collection("Chats");
  const findPokemon = await pokemonsCollection.findOne({ name: oldName, type: oldType });

  try{
    if (findPokemon) {
      const updatedPokemon = await pokemonsCollection.findOneAndUpdate(
        { name: oldName, type: oldType },
        { $set: { name: newName, type: newType } },
        { returnOriginal: false }
      );
      return updatedPokemon.value;
    } 
    else {
      throw new DatabaseError('Pokemon not found in database:' + ' Name: ' + oldName + ' Type: ' + oldType);  
    }
  }
  catch(err){
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
module.exports = {initialize, addChat, getSingleChat, getAllChats, close, getCollection,updateChat};
  