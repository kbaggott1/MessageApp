const validator = require("validator");
const userModel = require("../models/userModel");
const logger = require("../logs/logger.js");

/**
 * 
 * @param {*} 
 * @param {*} 
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