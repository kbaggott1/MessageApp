const { MongoClient, WriteError, ObjectId } = require("mongodb");
const InputError = require("./InvalidInputError.js");
const DBError = require("./DatabaseError.js");
const validateUtils = require("../helperMethods/validateUserData.js");
const logger = require("../logs/logger.js");
const bcrypt = require('bcrypt');
const saltRounds = 10;
let dbName;
let mongoClient;
let usersCollection;

/**
 * Initializes the connection to the MongoDB database. If the collection of users already exists, it will be used.
 * and if it does not already exist then it will be created. If the operation was successful a message is printed
 * to the console. If there was an issue connecting to the database, an error is thrown.
 * @param {*} database The name of the mongoDb database that will be connected to.
 * @param {*} url The url for the MongoDB connection
 * @param {boolean} resetFlag Indicates whether the database should be reset
 * @throws {DatabaseError} If the method fails to connect to the database this error is thrown
 */
async function initialize(database, url,  resetFlag = false) {
    try{
        dbName = database;

        mongoClient = new MongoClient(url);
        await mongoClient.connect();
        
        db = mongoClient.db(dbName);

        //Check to see if the users collection already exists
        collectionCursor = await db.listCollections({ name: "Users" });
        collectionArray = await collectionCursor.toArray();
        if(collectionArray.length == 0){
            const collation = { locale: "en", strength: 2 };

            await db.createCollection("Users", { collation: collation });
        }
        usersCollection = db.collection("Users")
        logger.info("Connected successfully to the MongoDB database!");

        if(resetFlag == true){
            await usersCollection.drop();
            logger.info("Collection Users from database " + database + "dropped!");
        }
    }
    catch(err){
        logger.error("Error! There was an issue connecting to the " +database+" database.");
        throw new DBError.DatabaseError("Error! There was an error connecting to the database.");
    }
}


/**
 * Takes in a username, password, status, first name, last name, biography and image and then 
 * adds them to the database as a user object and returns the user that was added to the database.
 * If one or both were not valid or there was an error connecting to the database, a corresponding 
 * error is thrown.
 * @param {string} username The username of the user that will be added to the database.
 * @param {string} password Password to be used for authentication of the user
 * @param {string} status The status of the user that will be added to the database
 * @param {string} firstName The first name of the user that will be added to the database
 * @param {string} lastName The last name of the user that will be added to the database
 * @param {string} biography The biography of the user that will be add to the database
 * @param {*} image The profile icon of the user that will be added to the database 
 * @throws {InvalidInputError} If the username or password were invalid this error is thrown.
 * @throws {DatabaseError} If the was an error while adding the user to the database this error is thrown.
 * @returns An object containing the username and password of the user.
 */
async function addUser(username, password, status, firstName, lastName, biography , image) {
    try{
        if(await validateUtils.isValidForAdd(usersCollection, username, password, status, firstName, lastName, biography)){
            let createDate = Date();
            password = await hashPassword(createDate, password);
            let newUser = { username: username, password: password, create_date: createDate, status: status, firstName: firstName, lastName: lastName, biography: biography, image: image};
            await usersCollection.insertOne(newUser);
            return newUser;
        }
        else{
            throw new InputError.InvalidInputError("Error! Username '" + username + "' and/or password '" + password + "' and/or status " + status + " and/or first name " + firstName + " and/or last name " + lastName + " and/or biography " + biography + " were invalid.");
        }
    }
    catch(err){
        if(err instanceof InputError.InvalidInputError){
            logger.error("Error! Username '" + username + "' and/or password '" + password + "' and/or status " + status + " and/or first name " + firstName + " and/or last name " + lastName + " and/or biography " + biography + " were invalid.");
            throw new InputError.InvalidInputError(err.message);
        }
        else{
            logger.error("Error! There was a database error while trying to add user " + username +".");
            throw new DBError.DatabaseError(err.message);
        }
    }
}

async function hashPassword(create_date, password) {
    const hashed = await bcrypt.hash(password + create_date + process.env.PASSWORD_PEPPER, saltRounds)
    return hashed;
}

/**
 * checks credentials entered to verify the credentials of a user.
 * If an error occurs, a corresponding error is thrown.
 * @param {string} username The username to be verified
 * @param {string} password The password to check if is correct
 * @throws {DatabaseError} If there is an error reading from the database this error is thrown.
 * @returns True when credentials are good, false if username is invalid or password does not match
 */
async function checkCredentials(username, password) {
    try{
        let user = await usersCollection.findOne({ username: username });

        if(!user){
            return false;
        }

        let passMatch = await bcrypt.compare(password + user.create_date + process.env.PASSWORD_PEPPER, user.password)

        return passMatch;
        
    }
    catch(err){
        logger.error("Error! There was an issue trying to find the user with ID " + id + " in the " + database + " database.")
        throw new DBError.DatabaseError(err.message);
    }
}


/**
 * Finds and returns a single user object that has the given id. It finds the first user
 * with that specific username. Meaning if there are multiple it will only return the first one.
 * If an error occurs, a corresponding error is thrown.
 * @param {string} id id of the user that will be searched for.
 * @throws {InvalidInputError} If the user could not be found in the database this error is thrown.
 * @throws {DatabaseError} If there is an error reading from the database this error is thrown.
 * @returns A user object representing the user with the provided username.
 */
async function getUser(id) {
    try{
        let object_id = new ObjectId(id);
        let user = await usersCollection.findOne({ _id: object_id });

        if(!user){
            throw new InputError.InvalidInputError("Error! User with ID '" + id + "' could not be found in the database.");
        }

        return user;
    }
    catch(err){
        if(err instanceof InputError.InvalidInputError){
            logger.error("Error! User with id " + id + " is invalid.");
            throw new InputError.InvalidInputError(err.message);
        }
        else{
            logger.error("Error! There was an issue trying to find the user with ID " + id + " in the " + dbName + " database.")
            throw new DBError.DatabaseError(err.message);
        }
    }
}

/**
 * Finds and returns a single user object that has the given username. It finds the first user
 * with that specific username. Meaning if there are multiple it will only return the first one.
 * If an error occurs, a corresponding error is thrown.
 * @param {string} username username of the user that will be searched for.
 * @throws {InvalidInputError} If the user could not be found in the database this error is thrown.
 * @throws {DatabaseError} If there is an error reading from the database this error is thrown.
 * @returns A user object representing the user with the provided username.
 */
async function getUserByUsername(username) {
    try{
        let user = await usersCollection.findOne({ username: username });

        if(!user){
            throw new InputError.InvalidInputError("Error! User with username '" + username + "' could not be found in the database.");
        }

        return user;
    }
    catch(err){
        if(err instanceof InputError.InvalidInputError){
            logger.error("Error! User with username " + username + " is invalid.");
            throw new InputError.InvalidInputError(err.message);
        }
        else{
            logger.error("Error! There was an issue trying to find the user with username " + username + " in the " + database + " database.")
            throw new DBError.DatabaseError(err.message);
        }
    }
}

/**
 * Gets all the users in the database. If an error occurs, a corresponding database error is thrown.
 * Note that this function returns ALL the users in the database. Meaning if there are many users this
 * function will return a massive array.
 * @throws {DatabaseError} if thee is an error retrieving the users from the database this error is thrown
 * @returns An array containing all the users in the database.
 */
async function getAllUsers() {
    try{
        let users = await usersCollection.find();
        
        if(users == null){
            throw new DBError.DatabaseError("Error! Unable to find any users in the " + dbName + " database.")
        }
        
        let arr = await users.toArray();
        return arr;
    }
    catch(err){
        if(err instanceof DBError.DatabaseError){
            logger.error("Error! There was an error in the getAllUsers method while trying to get all users from the " + database + " database");
            throw new DBError.DatabaseError(err.message);
        }
    }
}


/**
 * Modifies the username, password, status, first name, last name, biography and image of a specific user who's id 
 * is provided to the function. The function will not modify the user if the new user data is invalid and an error will
 * be thrown. An error will also be thrown if there is an error updating or other reasons. If the operation was successful
 * the new updated user object is returned.
 * @param {string} id Id of the user that will be updated.
 * @param {string} newUsername New username of the user that will be updated.
 * @param {string} newPassword New password of the user that will be updated.
 * @param {string} newStatus New status of the user that will be updated.
 * @param {string} newFirstName New first name of the user that will be updated.
 * @param {string} newLastName New last name of the user that will be updated.
 * @param {string} newBiography New biography of the user that will be updated.
 * @param {string} newImage New Image of the user that will be updated.
 * @throws {InvalidInputError} If the either the old username, new username or new password are invalid this error is thrown.
 * @throws {DatabaseError} If there is an error updating the user this error is thrown.
 * @returns The updated user object with the new values.
 */
async function updateUser(id, newUsername, newPassword, newStatus, newFirstName, newLastName, newBiography, newImage) {
    try{
        if(validateUtils.isValidForEdit(newUsername, newPassword, newStatus, newFirstName, newLastName, newBiography)){
            let object_id = new ObjectId(id);

            //newPassword = await hashPassword(newUsername, newPassword);
            let updatedUser = await usersCollection.updateOne({ _id: object_id }, { $set: { password: newPassword, username: newUsername, status: newStatus, firstName: newFirstName, lastName: newLastName, biography: newBiography} });
            
            if(updatedUser.modifiedCount <= 0){
                throw new InputError.InvalidInputError("Error! User with ID '" + id + "' could not be found in the database. Therefore nothing was updated.");
            }

            return await usersCollection.findOne({ _id: object_id });
        }
        else{
            throw new InputError.InvalidInputError("Error! Username '" + newUsername + "' and/or password '" + newPassword + "' and/or status " + newStatus + " and/or first name " + newFirstName + " and/or last name " + newLastName + " and/or biography " + newBiography + " were invalid. Therefore user with '" + id + "' was not updated.");
        }
    }
    catch(err){
        if(err instanceof InputError.InvalidInputError){
            logger.error("Error! Username '" + newUsername + "' and/or password '" + newPassword + "' and/or status " + newStatus + " and/or first name " + newFirstName + " and/or last name " + newLastName + " and/or biography " + newBiography + " were invalid. Therefore user with ID " + id + " was not updated");
            throw new InputError.InvalidInputError(err.message);
        }
        else{
            logger.error("Error! There was an error trying to the update user with the id '" + id + "' in the " + dbName + " database.");
            throw new DBError.DatabaseError(err.message);
        }
    }
}


/**
 * Deletes a user from the database whom has the given username. If the operation was successful, the function
 * returns an object of the user. Otherwise, an error is thrown.
 * @param {string} id ID of the user that will be removed from the database.
 * @throws {InputError} If the user that is being deleted does not exist this error is thrown
 * @throws {DatabaseError} If there is an error trying to delete the user from the database this error is thrown.
 * @returns The document of the deleted user. 
 */
async function deleteUser(id) {
    try{
        let object_id = new ObjectId(id);
        let deletedUser = await usersCollection.deleteOne({ _id: object_id });
            
        if(deletedUser.deletedCount <= 0){
            throw new InputError.InvalidInputError("Error! User with '" + id + "' could not be found in the database. Therefore nothing was deleted.");
        }

        return deletedUser;
    }
    catch(err){
        if(err instanceof InputError.InvalidInputError){
            logger.error("Error! The user with id '" + id + "' could not be found in the database and therefore could not be deleted");
            throw new InputError.InvalidInputError(err.message);
        }
        else{
            logger.error("Error! There was an issue trying to delete the user with id '" + id + "' from the " + dbName + " database");
            throw new DBError.DatabaseError(err.message);
        }
    }
}

/**
 * Closes the connection to MongoDB the database. An appropriate message is printed to
 * the console if the operation was successful or if it failed.
 */
async function close() {
    try{
        await mongoClient.close();
        logger.info("Disconnected from the MongoDB database!");
    }
    catch(err){
        logger.error("Error! There was an issue trying to close the database. " + err.message);
        throw new DBError.DatabaseError("Error! There was a problem closing the database. " + err.message);
    }
}

/**
 * Fetches the collection of pokemon so it can be used in other
 * files than this pokemonModelMongoDb.js
 * @returns Collection of pokemon
 */
function getCollection(){
    return usersCollection;
}

//Allows the functions to used in other files
module.exports = {
    initialize,
    addUser,
    getUser,
    getUserByUsername,
    getAllUsers,
    updateUser,
    deleteUser,
    getCollection,
    checkCredentials,
    close
}