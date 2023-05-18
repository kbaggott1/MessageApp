const e = require('express');
const express = require('express');
const { DatabaseError } = require('../models/DatabaseError');
const { InvalidInputError } = require('../models/InvalidInputError');
const { refreshSession } = require('./sessionController');
const router = express.Router();
const routeRoot = '/users';
const models = require('../models/userModel.js');
const logger = require("../logs/logger.js");


/**
 * Handles the addition of a new user to the database. This method takes in a request and response object
 * and modifies the body and status of the response based on if the create operation was successful.
 * @param {*} request The request object. Request body should contain username, password, status, firstName, lastName
 *                    biography and image variables.
 * @param {*} response The response object that is sent back to the user. Status code 200 indicates success all other
 *                     statuses are for failure cases. An appropriate message is sent back to the user in the body of the response.
 */
router.post('/', handleAddSingleUser);
async function handleAddSingleUser(request, response) {
    try{
        if(refreshSession(request, response) != null){
            const user = await models.addUser(request.body.username, request.body.password, request.body.status, request.body.firstName, request.body.lastName, request.body.biography, request.body.image);
            if(user){
                response.status("200");
                response.send(user);
            }
            else{
                logger.error("User " + request.body.username + " failed to be added to the database for an unknown reasons.");
                response.status("400");
                response.send({ errorMessage: "Error! failed to add User " + request.body.username + " with password " + request.body.password + " to the database. "});
            }
        }
    }
    catch(err){
        if(err instanceof InvalidInputError){
            logger.error("Username " + request.body.username + " and/or new password " + request.body.password + " and/or new status " + request.body.status + " and/or new first name " + request.body.firstName + " and/or new last name " + request.body.lastName + " and/or new biography " + request.body.biography + " was/were invalid");
            response.status("400");
            response.send({ errorMessage: "Error! The username " + request.body.username + " provided and/or the password " + request.body.password + " and/or new status " + request.body.status + " and/or new first name " + request.body.firstName + " and/or new last name " + request.body.lastName + " and/or new biography " + request.body.biography + " was/were invalid. " + err.message});
        }
        else if(err instanceof DatabaseError){
            logger.error("Database error was encountered while trying to add user " + request.body.username + " to the database");
            response.status("500");
            response.send({ errorMessage: "Error! There was an error connecting the database while trying to add user " + request.body.username + ". " + err.message});
        }
        else{
            logger.error("Error adding user " + request.body.username + " to the database. ");
            response.status("500");
            response.send({ errorMessage: "There was an issue adding the user to the database. " + err.message});
        }
    }
}


/**
 * Finds a user in the database. The ID of the user needs to be provided through the request body. Whether or not
 * the user is found an appropriate message is sent back and the status of the response is also modified to reflect 
 * the outcome of the read operation.
 * @param {*} request The request object. Should contain the ID of the user in the body
 * @param {*} response If the user was successfully found they are returned in the response
 *                     as a JSON. Otherwise the response contains a descriptive error message
 */
router.get('/user', handleReadSingleUser);
async function handleReadSingleUser(request, response) {
    try{
        if(refreshSession(request, response) != null){
            let foundUser = await models.getUser(request.body.userId);
            if(foundUser){
                response.status("200");
                response.json(foundUser);
            }
            else{
                logger.error("User with ID " + request.body.userId + " was not found in the database for unknown reasons.");
                response.status("400");
                response.send({ errorMessage: "Error! Failed to find user with ID " + request.body.userId + " in the database."});
            }
        }
    }
    catch(err){
        if(err instanceof InvalidInputError){
            logger.error("User with ID " + request.body.userId + " could not be found in the database. ");
            response.status("400");
            response.send({ errorMessage: "Error! the user with ID " + request.body.userId + " could not be found in the database " + err.message});
        }
        else if(err instanceof DatabaseError){
            logger.error("Database error was encountered while trying to find user with ID " + request.body.userId + " in the database");
            response.status("500");
            response.send({ errorMessage: "Error! There was an error connecting the database while trying to find user with ID " + request.params.userId + ". " + err.message});
        }
        else{
            logger.error("Error finding user in the database. " + err.message);
            response.status("500");
            response.send({ errorMessage: "There was an issue find the user in the database. " + err.message});
        }
    }
}

/**
 * Finds a user in the database. The username of the user needs to be provided through the request body. Whether or not
 * the user is found an appropriate message is sent back and the status of the response is also modified to reflect 
 * the outcome of the read operation.
 * @param {*} request The request object. Should contain the username of the user in the body
 * @param {*} response If the user was successfully found they are returned in the response
 *                     as a JSON. Otherwise the response contains a descriptive error message
 */
router.get('/:username', handleReadSingleUserByUsername);
async function handleReadSingleUserByUsername(request, response) {
    try{
        if(refreshSession(request, response) != null){
            let foundUser = await models.getUserByUsername(request.params.username);
            if(foundUser){
                response.status("200");
                response.json(foundUser);
            }
            else{
                logger.error("User with username " + request.params.username + " was not found in the database for unknown reasons.");
                response.status("400");
                response.send({ errorMessage: "Error! Failed to find user with username " + request.params.username + " in the database."});
            }
        }
    }
    catch(err){
        if(err instanceof InvalidInputError){
            logger.error("User with username " + request.params.username + " could not be found in the database. ");
            response.status("400");
            response.send({ errorMessage: "Error! the user with username " + request.params.username + " could not be found in the database " + err.message});
        }
        else if(err instanceof DatabaseError){
            logger.error("Database error was encountered while trying to find user with username " + request.params.username + " in the database");
            response.status("500");
            response.send({ errorMessage: "Error! There was an error connecting the database while trying to find user with username " + request.params.username + ". " + err.message});
        }
        else{
            logger.error("Error finding user in the database. " + err.message);
            response.status("500");
            response.send({ errorMessage: "There was an issue find the user in the database. " + err.message});
        }
    }
}

/**
 * Searches the database for all users. No parameters need to be passed to the function since it gets all users.
 * If the operation succeeds in finding any number of users then they are put into the body of the response otherwise
 * an appropriate error message will be sent in the body of the response.
 * @param {*} request The request object. Should contain no parameters in the url or request body
 * @param {*} response The response object. If there were users in the database that were found the body contains
 *                     a JSON list of the users. If no users were found or an error was encountered the body will
 *                     contain a corresponding error message. The status will reflect the success or failure of
 *                     operation.
 */
router.get('/', handleReadAllUsers);
async function handleReadAllUsers(request, response){
    try{
        if(refreshSession(request, response) != null){
            let foundUsers = await models.getAllUsers();
            if(foundUsers.length > 0){
                response.status("200");
                response.json(foundUsers);
            }
            else{
                logger.error("Couldn't find any users");
                response.status("400");
                response.send({ errorMessage: "Error! Failed to find any users in the database"});
            }
        }
    }
    catch(err){
        if(err instanceof InvalidInputError){
            logger.error("No users could be found in the database ");
            response.status("400");
            response.send({ errorMessage: "Error! No users could be found in the database. The database is empty. " + err.message});
        }
        else if(err instanceof DatabaseError){
            logger.error("Database error was encountered while trying to find all users in the database");
            response.status("500");
            response.send({ errorMessage: "Error! There was an error connecting the database while trying to find all users. " + err.message});
        }
        else{
            logger.error("Error finding users in the database.");
            response.status("500");
            response.send({ errorMessage: "There was an unknown issue while trying to find all users in the database. " + err.message});
        }
    }
}


/**
 * Finds a user in the database who's username is the same as the oldUsername parameter and replaces the username and 
 * password of that user with the newUsername and newPassword provided to the method as parameters in the URL. If the user
 * never existed, the new username is invalid or any other type of error is encountered the body of the response will contain
 * a string error message, otherwise it will contain the updated user.
 * @param {*} request The request object. Body should contain parameters userId, username, password, status, firstName, lastName,
 *                    biography and image.
 * @param {*} response If the user was successfully updated they are returned in the response
 *                     as a JSON. Otherwise the response contains a descriptive error message.
 */
router.put('/', handleUpdateSingleUser);
async function handleUpdateSingleUser(request, response){
    try{
        if(refreshSession(request, response) != null){
            const updatedUser = await models.updateUser(request.body.userId, request.body.username, request.body.password, request.body.status, request.body.firstName, request.body.lastName, request.body.biography, request.body.image);
            if(updatedUser){
                response.status("200");
                response.json(updatedUser);
            }
            else{
                logger.error("User with ID '" + request.body.userId + "' failed to be updated for an unknown reasons.");
                response.status("400");
                response.send({ errorMessage: "Error! Failed to update user with ID '" + request.body.userId + "'. "});
            }
        }
    }
    catch(err){
        if(err instanceof InvalidInputError){
            logger.error("New username " + request.body.username + " and/or new password " + request.body.password + " and/or new status " + request.body.status + " and/or new first name " + request.body.firstName + " and/or new last name " + request.body.lastName + " and/or new biography " + request.body.biography + " was/were invalid");
            response.status("400");
            response.send({ errorMessage: "Error! New username " + request.body.username + " and/or new password " + request.body.password + " and/or new status " + request.body.status + " and/or new first name " + request.body.firstName + " and/or new last name " + request.body.lastName + " and/or new biography " + request.body.biography + " was/were invalid. " + err.message});
        }
        else if(err instanceof DatabaseError){
            logger.error("Database error was encountered while trying to update user with ID '" + request.body.userId + "'");
            response.status("500");
            response.send({ errorMessage: "Error! There was an error connecting the database while trying to update user with ID " + request.body.userId + ". " + err.message});
        }
        else{
            logger.error("Error updating the user with ID " + request.body.userId + " from the database");
            response.status("500");
            response.send({ errorMessage: "There was an issue updating the user with ID " + request.body.userId + ". " + err.message});
        }
    }
}


/**
 * Deletes a user from the database that matches the userId provided in the parameters.
 * If the user was successfully deleted the user document is returned in the body of the response.
 * If the operation failed for any reason the status is modified accordingly and the response will
 * contain a corresponding error message.
 * @param {*} request The request object. Should contain a userId parameter in the body of the request
 * @param {*} response If the user was successfully deleted they are returned in the response
 *                     as a JSON. Otherwise the response contains a descriptive error message.
 */
router.delete('/', handleDeleteSingleUser);
async function handleDeleteSingleUser(request, response){
    try{
        if(refreshSession(request, response) != null){
            const deletedUser = await models.deleteUser(request.body.userId);
            if(deletedUser){
                response.status("200");
                response.json(deletedUser);
            }
            else{
                logger.error("User with id '" + request.body.userId + "' failed to be deleted from the database for an unknown reasons.");
                response.status("400");
                response.send({ errorMessage: "Error! failed to delete with id '" + request.body.userId + "' from the database. "});
            }
        }
    }
    catch(err){
        if(err instanceof InvalidInputError){
            logger.error("User with id '" + request.body.userId + "' was not valid for a delete operation");
            response.status("400");
            response.send({ errorMessage: "Error! The user with id '" + request.body.userId + "' does not currently exist in the database. " + err.message});
        }
        else if(err instanceof DatabaseError){
            logger.error("Database error was encountered while trying to delete user with id " + request.body.userId + " from the database");
            response.status("500");
            response.send({ errorMessage: "Error! There was an error connecting the database while trying to delete user with id " + request.body.username + ". " + err.message});
        }
        else{
            logger.error("Unknown error encountered while deleting user with id" + request.body.userId + " from the database.");
            response.status("500");
            response.send({ errorMessage: "There was an issue deleting the user with id " + request.body.userId + "  from the database. " + err.message});
        }
    }
}


module.exports = {
    router,
    routeRoot
}