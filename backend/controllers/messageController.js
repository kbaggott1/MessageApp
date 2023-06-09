const express = require('express');
const { DatabaseError } = require('../models/DatabaseError');
const { InvalidInputError } = require('../models/InvalidInputError');
const { refreshSession } = require('./sessionController');
const router = express.Router();
const routeRoot = '/messages';
const MessagesModelMongoDb = require("../models/messageModel");
const logger = require("../logs/logger");
const userModel = require("../models/userModel");

module.exports = {
    router,
    routeRoot
}


router.post("/", createMessage);
/**
 * Called on post
 * @param {*} req Requests with body params: messageBody, authorId, chatId
 * @param {*} res Resolves with status 200, 400, or 500
 * @throws InvalidInputError when input was not in a valid format; Throws Database Error.
 */
async function createMessage(req, res) { 
    try {
        if(refreshSession(req, res) != null){
            let message = await MessagesModelMongoDb.postMessage(req.body.messageBody, req.body.authorId, req.body.chatId);
            if(message) {
                res.status("200");
                res.json(message);
            }
            else {
                res.status("400");
                res.send("Could not add message to database.");
                logger.error("Could not add message in controller.");
            }
        }
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            res.status("500");
            res.send("Database Error trying to add message");
            logger.error("Database Error trying to add message in controller: "+err.message);
        }
        else 
        if(err instanceof InvalidInputError) {
            res.status("400");
            res.send("Invalid input, cant add message");
            logger.error("Invalid input trying to add message: "+err.message);
        }
        else {
            res.status("500");
            res.send("Error trying to add message");
            logger.error("Error try to add in controller: "+err.message);
        }
    }
}

router.get("/chatid/:id", getMessages)
/**
 * Called on get to retrieve all messages from a specific chatId
 * @param {*} req Request with body params chatId.
 * @param {*} res Responds with all messages via json. Resovles with status 200 or 500.
 * @throw InvalidInputError and DatabaseError
 */
async function getMessages(req, res) {
    try {
        let messages = await MessagesModelMongoDb.getMessagesByChatId(req.params.id.toString());
        if(messages) {
            res.status("200");
            res.json(messages);
        }

            
    }
    catch(err) {
        if(err instanceof InvalidInputError) {
            res.status("400");
            res.send("InvalidInputError Error trying to get messages");
            logger.error("InvalidInputError trying to get all messages in controller: "+err.message);
        }
        else {
            res.status("500");
            res.send("Error trying to get messages");
            logger.error("Error trying to get all messages in controller: "+err.message);
        }
    }
}


router.get("/:id", getMessage);
/**
 * Called on get with message id
 * @param {*} req Requests with parameter: id
 * @param {*} res Resolves with status 200, 400 or 500.
 * @throws InvalidInputError and DatabaseError
 */
async function getMessage(req, res) {
    try {
        if(refreshSession(req, res) != null){
            let message = await MessagesModelMongoDb.getMessageById(req.params.id);

            if(message) {
                res.status("200");
                res.json(message);
            } else {
                res.status("400");
                res.send("Unable to find message");
                logger.error("Unable to find message in controller");
            }
        }
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            res.status("500");
            res.send("Database Error trying to get message");
            logger.error("Database Error trying to get in controller: "+err.message);
        }
        else
        if(err instanceof InvalidInputError) {
            res.status("400");
            res.send("Can't find message");
            logger.error("Invalid input trying to get message: "+err.message);
        }
        else {
            res.status("500");
            res.send("Error trying to get message");
            logger.error("Error trying to get message in controller: "+err.message);
        }
    }
}


router.put("/", updateMessage);
/**
 * Called on put to update a message
 * @param {*} req Requests with body parameters: messageId, message
 * @param {*} res Resolves with status 200, 400 or 500.
 * @throws InvalidInputError and DatabaseError.
 */
async function updateMessage(req, res) {
    try {
        if(refreshSession(req, res) != null){
            let message = await MessagesModelMongoDb.editMessage(req.body.messageId, req.body.messageBody);
            if(message) {
                res.status("200");
                res.json(message);
            }
            else {
                res.status("400");
                res.send("Could not edit message to database.");
                logger.error("Could not edit message in controller.");
            }
        }
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            res.status("500");
            res.send("Database Error trying to edit message");
            logger.error("Database Error trying to edit message in controller: "+err.message);
        }
        else 
        if(err instanceof InvalidInputError) {
            res.status("400");
            res.send("Invalid input, cant edit message");
            logger.error("Invalid input trying to edit message: "+err.message);
        }
        else {
            res.status("500");
            res.send("Error trying to edit message");
            logger.error("Error trying to edit in controller: "+err.message);
        }
    }
}

router.delete("/", deleteMessage);
/**
 * Called on delete to delete a messsage by id
 * @param {*} req Requests body parameter: messageId
 * @param {*} res Resolves with status 200 or 500.
 * @throws InvalidInputError and DatabaseError.
 */
async function deleteMessage(req, res) {
    try {
        if(refreshSession(req, res) != null){
            await MessagesModelMongoDb.deleteMessageById(req.body.messageId);
            res.status("200");
            res.send("Deleted message of id: " + req.body.messageId);
        }
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            res.status("500");
            res.send("Database Error trying to delete message");
            logger.error("Database Error trying to delete in controller: "+err.message);
        }
        else {
            res.status("500");
            res.send("Error trying to delete message");
            logger.error("Error trying to delete message in controller: "+err.message);
        }
    }
}