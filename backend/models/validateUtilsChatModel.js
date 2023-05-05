const validator = require("validator");
const {InvalidInputError} = require("./InvalidInputError");
const userModel = require("./userModel");

/**
 * Checks if a name of pokemon has been provided, if it is alpha and if it is within the allowed types. Returns true or false.
 * @param {*} name of user.
 * @param {*} type of user.
 * @returns Boolean true or false.
 */
function isValid2(userSenderId, userRecipientId)
{
    let userSenderIdFound = userModel.getUser(userSenderId);   
    let userRecipientId = userModel.getUser(userRecipientId);  

    if(userSenderIdFound && userRecipientIdFound)
    {
        return true;
    }
    else
    {
        return false;
    }
     
}

module.exports = { isValid2 };

