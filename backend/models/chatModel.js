const dbName = "pokemon_db";
const dbNameTest = "pokemon_db_test";
let mongod;
const { MongoClient, Long } = require("mongodb");
const validateUtils = require("./validateUtils");
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
      const pokemonsCollection = db.collection("pokemons");

      if(reset){
        await pokemonsCollection.drop();
      }
      
      // Check to see if the pokemons collection exists
      collectionCursor = await db.listCollections({ name: "pokemons" });
      collectionArray = await collectionCursor.toArray();
      if (collectionArray.length == 0) {  
      // collation specifying case-insensitive collection
      const collation = { locale: "en", strength: 1 };
      // No match was found, so create new collection
      await db.createCollection("pokemons", { collation: collation });
      }    
    } 
    catch (err) {
    logger.error(err.message);
    throw new DatabaseError(err.message);
    }
}

/**
 * Adds pokemon to the MongoDB database if name and type is valid. Throws a DatabaseError exception if invalid pokemon was passed.
 * @param {*} name of pokemon.
 * @param {*} type of pokemon.
 */
async function addPokemon(name, type){
    try{  
            if(validateUtils.isValid2(name, type)){
              const db = client.db(dbName);
              const pokemonsCollection = db.collection("pokemons")
              const pokemon = await pokemonsCollection.insertOne({ name, type }); 
              return pokemon;
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
 * Finds the pokemon with the provided name in the database. Throws DatabaseError exception if the pokemon was not found in the database.
 * @param {*} name Name of the pokemon.
 * @returns 
 */
async function getSinglePokemon(name){
  try{
    const db = client.db(dbName);
    pokemonsCollection = db.collection("pokemons");
    let pokemon = await pokemonsCollection.findOne({ name });
    if(pokemon){
      console.log(pokemon);
      return pokemon; 
    }
    else{
      throw new DatabaseError("Pokemon not found in database: " + name);
    }
  }
  catch(err){
    throw new DatabaseError(err.message);
  }
}

/**
 * Gets the list of all pokemons in the database collection and displays them in a table. Throws a DatabaseError exception if there are no pokemon in the database collection.
 */
async function getAllPokemon(){
  const db = client.db(dbName);
  pokemonsCollection = db.collection("pokemons");
  try{
    const pokemonsArray = await pokemonsCollection.find().toArray();
    if(pokemonsArray.length != 0){
      console.table(pokemonsArray);
      return pokemonsArray;
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

async function updatePokemon(oldName, oldType, newName, newType) {
  const db = client.db(dbName);
  const pokemonsCollection = db.collection("pokemons");
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
  return db.collection("pokemons");
}
module.exports = {initialize, addPokemon, getSinglePokemon, getAllPokemon, close, getCollection,updatePokemon};
  