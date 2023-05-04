const validator = require("validator");
const {InvalidInputError} = require("./InvalidInputError");

/**
 * Checks if a name of pokemon has been provided and if it is within the allowed types. Returns true or false.
 * @param {*} name of pokemon.
 * @param {*} type of pokemon.
 * @returns Boolean true or false.
 */
function isValid1(id, userSenderId, userRecipientId)
{
    if(!name)
    {
        throw new InvalidInputError("Name is required.");
    }
    else if(type == "Normal" || type == "Grass" || type == "Fire" || type == "Water" || type == "Electric" || type == "Psychic")
    {
        return true;
    }
    else
    {
        throw new InvalidInputError("Type cannot be anything else than Normal, Grass, Fire, Water, Electric and Psychic.");
    }
}

/**
 * Checks if a name of pokemon has been provided, if it is alpha and if it is within the allowed types. Returns true or false.
 * @param {*} name of user.
 * @param {*} type of user.
 * @returns Boolean true or false.
 */
function isValid2(id, userSenderId, userRecipientId)
{
     if(!name || !validator.isAlpha(name))
    {
        return false;
    }
     else if(type == "Normal" || type == "Grass" || type == "Fire" || type == "Water" || type == "Electric" || type == "Psychic")
    {
        return true;
    }
     else
    {
        return false;
    }
     
}

module.exports = { isValid1, isValid2 };

