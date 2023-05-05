const validator = require("validator");
const userModel = require("../models/userModel");
const logger = require("../logs/logger.js");

/**
 * 
 * @param {*} 
 * @param {*} 
 * 
 */
function isValid(userSenderId, userRecipientId)
{
    try{
        userModel.getUser(userSenderId);  
        userModel.getUser(userRecipientId);  
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

