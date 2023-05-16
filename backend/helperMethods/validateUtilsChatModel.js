const validator = require("validator");
const userModel = require("../models/userModel");
const logger = require("../logs/logger.js");

/**
 * Checks if both the userSenderId and the userRecipientId are in the database. Returns true or false and logs error otherwise.
 * @param {*} userSenderId of chat.
 * @param {*} userRecipientId of chat.
 * 
 */
async function isValid(userSenderId, userRecipientId)
{
    try{
        await userModel.getUser(userSenderId);  
        await userModel.getUser(userRecipientId);  
        logger.info("userSenderId: " + userSenderId + " and" + "userRecipientId: " + userRecipientId + " sucessfully validated.")
        return true;
    }
    catch(err)
    {
        logger.error("Invalid userSenderId: " + userSenderId + " or" + "userRecipientId: " + userRecipientId);
        return false;
    }
     
}

module.exports = { isValid };

