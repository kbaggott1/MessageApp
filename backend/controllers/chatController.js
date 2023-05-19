const express = require('express');
const { DatabaseError } = require('../models/DatabaseError');
const { InvalidInputError } = require('../models/InvalidInputError');
const { refreshSession } = require('./sessionController');
const router = express.Router();
const routeRoot = '/chats';
const ChatsModelMongoDb = require("../models/chatModel");
const logger = require("../logs/logger");

module.exports = {
    router,
    routeRoot
}

/** Adds a chat to a database.
 * @param {*} req Requests body parameters: userSenderId, userRecipientId
 * @param {*} res Resolves with status 200, 400 or 500.
 * @throws InvalidInputError or DatabaseError.
 */
router.post("/", createChat);
async function createChat(req, res) { 
    try {
        if(refreshSession(req, res) != null){
            let chat = await ChatsModelMongoDb.addChat(req.body.userSenderId, req.body.userRecipientId);
            if(chat) {
                res.status(200);
                res.send(chat);
            } else {
                let message = `Could not add chat to database with senderId: ${req.body.userSenderId}, recipientId: ${req.body.userRecipientId}`;
                res.status(400);
                res.send(message);
                logger.error("In controller: " + message);
            }
        }
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            let message = "Database Error while adding chat with senderId: " + req.body.userSenderId + ", recipientId: " + req.body.userRecipientId + ": " + err.message;
            res.status(500);
            res.send(message);
            logger.error("In controller: " + message);
        } else if(err instanceof InvalidInputError) {
            let message = "Invalid Input Error while adding chat with senderId: " + req.body.userSenderId + ", recipientId: " + req.body.userRecipientId + ": " + err.message;
            res.status(400);
            res.send(message);
            logger.error("In controller: " + message);
        } else {
            let message = "Unexpected Error while adding chat with senderId: " + req.body.userSenderId + ", recipientId: " + req.body.userRecipientId + ": " + err.message;
            res.status(500);
            res.send(message);
            logger.error("In controller: " + message);
        }
    }
}

/** Gets all chats from database.
 * 
 * @param {*} res Resolves with status 200, 400 or 500.
 * @throws InvalidInputError or DatabaseError.
 */
router.get("/", getChats)
async function getChats(req, res) {
    try {
        if(refreshSession(req, res) != null){
            let chats = await ChatsModelMongoDb.getAllChats();
            res.status(200);
            res.json(chats);
        }
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            let message = "Database Error while getting all chats: "+err.message;
            res.status(500);
            res.send(message);
            logger.error("In controller: " + message);
        }
        else if(err instanceof InvalidInputError) {
            let message = "Invalid input while getting all chats: "+err.message;
            res.status(400);
            res.send(message);
            logger.error("In controller: " + message);
        }
        else {
            let message = "Unexpected error in controller while getting all chats: "+err.message;
            res.status(500);
            res.send(message);
            logger.error("In controller: " + message);
        }
    }
}

/** Gets single chat.
 * @param {*} req Requests params parameter: id
 * @param {*} res Resolves with status 200, 400 or 500.
 * @throws InvalidInputError or DatabaseError.
 */ 
router.get("/:id", getChat);
async function getChat(req, res) {
    try {
        if(refreshSession(req, res) != null){
            let chat = await ChatsModelMongoDb.getSingleChat(req.params.id);
            if(chat) {
                res.status(200);
                res.json(chat);
            } else {
                let message = `Unable to find chat with id: ${req.params.id}`;
                res.status(400);
                res.send(message);
                logger.error("In controller: " + message);
            }
        }
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            let message = "Database Error while getting chat with id: " + req.params.id + ": " + err.message;
            res.status(500);
            res.send(message);
            logger.error("In controller: " + message);
        } else if(err instanceof InvalidInputError) {
            let message = "Invalid input while getting chat with id: " + req.params.id + ": " + err.message;
            res.status(400);
            res.send(message);
            logger.error("In controller: " + message);
        } else {
            let message = "Unexpected error in controller while getting chat with id: " + req.params.id + ": " + err.message;
            res.status(500);
            res.send(message);
            logger.error("In controller: " + message);
        }
    }
}

/**
 * Deletes a chat from the database.
 * @param {*} req Requests body parameter: id
 * @param {*} res Resolves with status 200, 400 or 500.
 * @throws InvalidInputError or DatabaseError.
 */
router.delete("/", deleteChat);
async function deleteChat(req, res) {
    try {
        if(refreshSession(req, res) != null){
            const deletedChat = await ChatsModelMongoDb.deleteChat(req.body._id);
            res.status(200)
            res.json(deletedChat);
        }
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            let message = "Database Error while deleting chat with id: "+req.body._id+": "+err.message;
            res.status(500);
            res.send(message);
            logger.error("In controller: " + message);
        } else if(err instanceof InvalidInputError) {
            let message = "Invalid input while deleting chat with id: "+req.body._id+": "+err.message;
            res.status(400);
            res.send(message);
            logger.error("In controller: " + message);
        } else {
            let message = "Unexpected error in controller while deleting chat with id: "+req.body._id+": "+err.message;
            res.status(500);
            res.send(message);
            logger.error("In controller: " + message);
        }
    }
}

/** Gets all chats for a specific sender.
 * @param {*} req Requests params parameter: senderId
 * @param {*} res Resolves with status 200, 400 or 500.
 * @throws InvalidInputError or DatabaseError.
 */
router.get("/chatsBySenderId/:senderId", getChatsBySenderId);
async function getChatsBySenderId(req, res) {
    try {
        let chats = await ChatsModelMongoDb.getChatsBySenderId(req.params.senderId);
        if(chats && chats.length > 0) {
            res.status(200);
            res.json(chats);
        } else {
            let message = `Unable to find chats with senderId: ${req.params.senderId}`;
            res.status(400);
            res.send(message);
            logger.error("In controller: " + message);
        }
        
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            let message = "Database Error while getting chats with senderId: " + req.params.senderId + ": " + err.message;
            res.status(500);
            res.send(message);
            logger.error("In controller: " + message);
        } else if(err instanceof InvalidInputError) {
            let message = "Invalid input while getting chats with senderId: " + req.params.senderId + ": " + err.message;
            res.status(400);
            res.send(message);
            logger.error("In controller: " + message);
        } else {
            let message = "Unexpected error in controller while getting chats with senderId: " + req.params.senderId + ": " + err.message;
            res.status(500);
            res.send(message);
            logger.error("In controller: " + message);
        }
    }
}