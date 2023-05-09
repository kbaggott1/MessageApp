
require('dotenv').config();
jest.setTimeout(10000);
const { MongoMemoryServer } = require('mongodb-memory-server');
const model = require("../models/userModel.js");
const { initialize } = require('../models/userModel.js');
const utils = require("../helperMethods/validateUserData.js");

//Valid user data used for testing
const userData = [
    { username: "admin", password: "superSafePassword123", status: 'online', firstName: 'admin', lastName: 'admin' , biography: 'Admin of the page', image:'placeholder'},
    { username: "John", password: "AlabamaSunshine06", status: 'away', firstName: 'John', lastName: 'Doe', biography: 'From Alabama', image: 'placeholder'},
    { username: "Jane", password: "Banana07$", status: 'offline', firstName: 'Jane', lastName: 'Doe', biography: 'An anonymous user looking for a good time', image: 'placeholder'},
    { username: "Levar", password: "ReadingRainbow", status:'online', firstName: 'Levar', lastName: 'Burton', biography: 'Reading is the key', image: 'placeholder'},
    { username: "Teddy", password: "BearLover098", status: 'away', firstName: 'Teddy', lastName: 'Roosevelt', biography: 'President of the USA!', image: 'placeholder'},
    { username: "Chris", password: "FighterPlane16", status: 'offline', firstName: 'Chris', lastName: 'Rodinos', biography: 'flying high', image: 'placeholder'},
    { username: "Jacob", password: "kingsAndQueens", status: 'away', firstName: 'Jacob', lastName: 'Foucher', biography: 'Working hard or hardly working', image: 'placeholder'},
    { username: "Jackson", password: "Online67", status: 'away', firstName: "Jackson", lastName: "Lackson", biography: 'bruh bruh bruh', image: 'placeholder'},
    { username: "Sarah", password: "CitesAndPsudeoCities", status: 'online', firstName: "Sara", lastName: "Leroux", biography: " English words ", image: "placeholder"},
    { username: "Maurice", password: "MoveIt", status: "online", firstName: "Maurice", lastName: "King", biography: "Owner of madagascar", image: "placeholder"},
    { username: "Chad", password: "AppleTree123", status: "offline", firstName: "Chad", lastName: "Treyvon", biography: "#Football is life", image: "placeholder" },
    { username: "Cristiano", password: "ComputerScientist", status: "online", firstName: "Cristiano", lastName: "Fazi", biography: "Please give me a good grade please", image: "placeholder" },
    { username: "Jason" , password: "JavaEnthusiast", status: "offline", firstName: "Jason", lastName: "Lastname", biography: "Yep, that's my last name", image: "placeholder" },
    { username: "Shrek" , password: "GetOutOfMySwamp", status: "offline", firstName: "Shrek", lastName: "Ogre", biography: "Get out of my swamp", image: "placeholder" },
    { username: "Donkey", password: "ShreksBestFriend", status: "online", firstName: "Donkey", lastName: "TheDonkey", biography: "I <3 Shrek", image: "placeholder"},
    { username: "Pinochio", password: "LongNose99", status: "online", firstName: "Pinochio", lastName: "Giupetto", biography: "My nose will grow", image: "placeholder" },
    { username: "Fiona", password: "Ogress", status: "offline", firstName: "Fiona", lastName: "Ogre", biography: "Orge of the castle", image: "placeholder" },
    { username: "LordFarquad", password: "ShortKing", status: "away", firstName: "Faquad", lastName: "Farquid", biography: "Mirror mirror on the wall", image: "placeholder" },
    { username: "GingerbreadMan", password: "LoserOfLegs222", status: "away", firstName: "Ginger", lastName: "Bread", biography: "I like cookies", image: "placeholder" },
    { username: "FirstLittlePig", password: "StrawIsBest", status: "online", firstName: "Piggie", lastName: "Little", biography: "Best building material is straw", image: "placeholder" },
    { username: "SecondLittlePig", password: "WoodIsBest", status: "offline", firstName: "Piggie", lastName: "Little", biography: "Best building material is wood", image: "placeholder" },
    { username: "thirdLittlePig", password: "BrickIsBest" , status: "offline", firstName: "Piggie", lastName: "Little", biography: "Best building material is brick", image: "placeholder"},
    { username: "BigBadWolf", password: "pigsaredleicious" , status: "online", firstName: "Wolf", lastName: "Dog", biography: "Blowing the little pigs", image: "placeholder"},
    { username: "Thelonious", password: "JudgeJuryAndExecutioner321", status: "away", firstName: "Thelonious", lastName: "Mastermead", biography: " ", image: "placeholder"},
    { username: "MagicMirror", password: "FairestOfThemAll", status: "away", firstName: "Magic", lastName: "Mirror", biography: "Nope", image: "placeholder"},
    { username: "ThisIsReally", password: "GettingOutOfHand", status: "online", firstName: "Help", lastName: "TooMany", biography: "I don't know what to do anymore", image: "placeholder"}
]
/**
 * This function picks a random user from a list of valid user data and returns a single user object
 * @returns a random valid user object from the userData array
 */
const generateValidUserData = () => userData.splice(Math.floor(Math.random() * userData.length), 1)[0];

let mongod;

/**
 * This function initializes the database to use the dummy database and throws an error if there was a problem.
 * It is run each before each test and resets the database each time.
 */
beforeEach(async () => {
    try {
        mongod = await MongoMemoryServer.create();
        const url = await mongod.getUri();

        await initialize("Test_Message_App", url, true);
        console.log("Mongo mock started!");
    }
    catch (err){
        console.log(err.message);
    }
})

/**
 * Closes the connection to the database after each test.
 */
afterEach(async () => {
    await mongod.stop();
    console.log("Mongo mock connection stopped");
});



//TESTING ADD USER

/**
 * Tests to see if the the addUser method successfully adds a new user to the database.
 * It does this by trying to add the user to the database and then trying to find the user.
 */
test("Adding user with valid user data", async () => {
    const user = generateValidUserData();

    let addedUser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);
    let readUser = await model.getUser(addedUser._id);
    
    expect(addedUser.username).toBe(readUser.username);
    expect(addedUser.password).toBe(readUser.password);
    expect(addedUser.status).toBe(readUser.status);
    expect(addedUser.firstName).toBe(readUser.firstName);
    expect(addedUser.lastName).toBe(readUser.lastName);
    expect(addedUser.biography).toBe(readUser.biography);
})

/**
 * Tries to add a user with an invalid username. Test passes if the method throws an error
 */
test("Adding user with invalid username", async () => {
    const user = { username: " ", password: "password123", status: "online", firstName: "test", lastName: "test", biography: "This is a test", image: "placeholder"};

    expect(async () => (await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image))).rejects.toThrow();
})


/**
 * Tries to add a user with null as the password. Test passes if the addUser method rejects it
 */
test("Adding user with invalid password", async () => {
    const user = { username: "Username", password: null, status: "online", firstName: "test", lastName: "test", biography: "This is a test", image: "placeholder"};

    expect(async () => (await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image))).rejects.toThrow();
})

/**
 * Tries to add a user with an invalid status. Test passes if the addUser method rejects it
 */
test("Adding user with invalid status", async () => {
    const user = { username: "Username", password: "password123", status: "interference", firstName: "test", lastName: "test", biography: "This is a test", image: "placeholder"};

    expect(async () => (await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image))).rejects.toThrow();
    
})

/**
 * Tries to add a user with an invalid status. Test passes if the addUser method rejects it
 */
test("Adding user with invalid first name", async () => {
    const user = { username: "Username", password: "password123", status: "online", firstName: null, lastName: "test", biography: "This is a test", image: "placeholder"};

    expect(async () => (await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image))).rejects.toThrow();
})

/**
 * Tries to add a user with and invalid last name. Test passes if the addUser method rejects it
 */
test("Adding user with invalid last name", async () => {
    const user = { username: "Username", password: "password123", status: "online", firstName: "test", lastName: "", biography: "This is a test", image: "placeholder"};

    expect(async () => (await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image))).rejects.toThrow();
})

/**
 * Tries to add a user with and invalid biography. Test passes if the addUser method rejects it
 */
test("Adding user with invalid biography", async () => {
    const user = { username: "Username", password: "password123", status: "online", firstName: "test", lastName: "test", biography: undefined, image: "placeholder"};

    expect(async () => (await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image))).rejects.toThrow();
})

test("Adding user when the database is inaccessible", async () => {
    const user = generateValidUserData();

    await mongod.stop();

    expect(async () => (await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image))).rejects.toThrow();

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await initialize("Test_Message_App", url, true);
})



//Testing GetUser method

/**
 * Adds a user to the database and then tries to read that user. If the user that was read matches the one added the
 * test will pass, otherwise it will fail.
 */
test("Reading a user successfully", async () => {
    const user = generateValidUserData();

    let addedUser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);
    let readUser = await model.getUser(addedUser._id);
    
    expect(user.username).toBe(readUser.username);
    expect(user.password).toBe(readUser.password);
    expect(user.status).toBe(readUser.status);
    expect(user.firstName).toBe(readUser.firstName);
    expect(user.lastName).toBe(readUser.lastName);
    expect(user.biography).toBe(readUser.biography);
})

/**
 * Tries to read a user that doesn't exist. The test passes if the getUser method throws an error
 */
test("Reading a user that does not exist", async () => {
    expect(async () => await model.getUser('1141249124')).rejects.toThrow();
})

/**
 * Tries to read a user that has 'null' as their username. Function should throw an error
 */
test("Reading a user that is 'null'", async () => {
    expect(async () => await model.getUser(null)).rejects.toThrow();
})

test("Reading a user when the database is inaccessible", async () => {
    const user = generateValidUserData();
    let addedUser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);
    
    await mongod.stop();
    
    expect(async () => await model.getUser(addedUser._id)).rejects.toThrow();

    
    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await initialize("Test_Message_App", url, true);
})



//Testing GetAllUsers method

/**
 * Adds 5 users to the database and then reads the database. The test then compares the
 * users from the original array to those of the array received from the readUsers function
 * to determine if it read them properly.
 */
test("Reading all users from the database", async () => {
    const usersArray = [
        { username: "admin", password: "superSafePassword123", status: 'online', firstName: 'admin', lastName: 'admin' , biography: 'Admin of the page', image:'placeholder'},
        { username: "John", password: "AlabamaSunshine06", status: 'away', firstName: 'John', lastName: 'Doe', biography: 'From Alabama', image: 'placeholder'},
        { username: "Jane", password: "Banana07$", status: 'offline', firstName: 'Jane', lastName: 'Doe', biography: 'An anonymous user looking for a good time', image: 'placeholder'},
        { username: "Levar", password: "ReadingRainbow", status:'online', firstName: 'Levar', lastName: 'Burton', biography: 'Reading is the key', image: 'placeholder'},
        { username: "Teddy", password: "BearLover098", status: 'away', firstName: 'Teddy', lastName: 'Roosevelt', biography: 'President of the USA!', image: 'placeholder'}
    ]

    await model.addUser(usersArray[0].username, usersArray[0].password, usersArray[0].status, usersArray[0].firstName, usersArray[0].lastName, usersArray[0].biography, usersArray[0].image);
    await model.addUser(usersArray[1].username, usersArray[1].password, usersArray[1].status, usersArray[1].firstName, usersArray[1].lastName, usersArray[1].biography, usersArray[1].image);
    await model.addUser(usersArray[2].username, usersArray[2].password, usersArray[2].status, usersArray[2].firstName, usersArray[2].lastName, usersArray[2].biography, usersArray[2].image);
    await model.addUser(usersArray[3].username, usersArray[3].password, usersArray[3].status, usersArray[3].firstName, usersArray[3].lastName, usersArray[3].biography, usersArray[3].image);
    await model.addUser(usersArray[4].username, usersArray[4].password, usersArray[4].status, usersArray[4].firstName, usersArray[4].lastName, usersArray[4].biography, usersArray[4].image);


    let readUsers = await model.getAllUsers();
    for(let i = 0; i < readUsers.length; i++) {
        expect(readUsers[i].username).toBe(usersArray[i].username);
        expect(readUsers[i].password).toBe(usersArray[i].password);
        expect(readUsers[i].status).toBe(usersArray[i].status);
        expect(readUsers[i].firstName).toBe(usersArray[i].firstName);
        expect(readUsers[i].lastName).toBe(usersArray[i].lastName);
        expect(readUsers[i].biography).toBe(usersArray[i].biography);
    }
});

test("Reading all users when the database is inaccessible", async () => {
    const usersArray = [
        { username: "admin", password: "superSafePassword123", status: 'online', firstName: 'admin', lastName: 'admin' , biography: 'Admin of the page', image:'placeholder'},
        { username: "John", password: "AlabamaSunshine06", status: 'away', firstName: 'John', lastName: 'Doe', biography: 'From Alabama', image: 'placeholder'},
        { username: "Jane", password: "Banana07$", status: 'offline', firstName: 'Jane', lastName: 'Doe', biography: 'An anonymous user looking for a good time', image: 'placeholder'},
        { username: "Levar", password: "ReadingRainbow", status:'online', firstName: 'Levar', lastName: 'Burton', biography: 'Reading is the key', image: 'placeholder'},
        { username: "Teddy", password: "BearLover098", status: 'away', firstName: 'Teddy', lastName: 'Roosevelt', biography: 'President of the USA!', image: 'placeholder'}
    ]
    await model.addUser(usersArray[0].username, usersArray[0].password, usersArray[0].status, usersArray[0].firstName, usersArray[0].lastName, usersArray[0].biography, usersArray[0].image);
    await model.addUser(usersArray[1].username, usersArray[1].password, usersArray[1].status, usersArray[1].firstName, usersArray[1].lastName, usersArray[1].biography, usersArray[1].image);
    await model.addUser(usersArray[2].username, usersArray[2].password, usersArray[2].status, usersArray[2].firstName, usersArray[2].lastName, usersArray[2].biography, usersArray[2].image);
    await model.addUser(usersArray[3].username, usersArray[3].password, usersArray[3].status, usersArray[3].firstName, usersArray[3].lastName, usersArray[3].biography, usersArray[3].image);
    await model.addUser(usersArray[4].username, usersArray[4].password, usersArray[4].status, usersArray[4].firstName, usersArray[4].lastName, usersArray[4].biography, usersArray[4].image);


    await mongod.stop();

    expect(async () => await model.getAllUsers()).rejects.toThrow();

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await initialize("Test_Message_App", url, true);
})



//TESTING UPDATE USER

/**
 * To test updated user we write a new user to the database, update them and the see if we can find
 * the user based on their new updated username.
 */
test("Updating a user succesfully in the database", async () => {
    //Arrange
    const user = generateValidUserData();
    const newUser = generateValidUserData();

    //Act
    let addeduser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);//Write the user to the database
    let updatedUser = await model.updateUser(addeduser._id, newUser.username, newUser.password, newUser.status, newUser.firstName, newUser.lastName, newUser.biography, newUser.image);//Update the user information
    const readUser = await model.getUser(addeduser._id);//Try to find the new updated user
    
    //Assert
    expect(readUser.username).toBe(updatedUser.username);
    expect(readUser.password).toBe(updatedUser.password);
    expect(readUser.status).toBe(updatedUser.status);
    expect(readUser.firstName).toBe(updatedUser.firstName);
    expect(readUser.lastName).toBe(updatedUser.lastName);
    expect(readUser.biography).toBe(updatedUser.biography);
    expect(readUser.image).toBe(updatedUser.image);
})

/**
 * This test tries to update a user that does not exist in the database. The test passes if the method
 * throws an error.
 */
test("Updating a user that does not exist in the database", async () => {
    const user = generateValidUserData();

    expect(async () => await model.updateUser("Qe19513598", user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image)).rejects.toThrow();
})

/**
 * Creates a new user and the entries to update the with an invalid new username.
 * If all is as it should, an error is thrown.
 */
test("Updating a user with an invalid new username", async () => {
    const user = generateValidUserData();
    const newUser = generateValidUserData();

    let addeduser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);

    expect(async () => await model.updateUser(addeduser._id, null, newUser.password, newUser.status, newUser.firstName, newUser.lastName, newUser.biography, newUser.image)).rejects.toThrow();
})


/**
 * Creates a new user and the entries to update the with an invalid new password.
 * If all is as it should, an error is thrown.
 */
test("Updating a user with an invalid new password", async () => {
    const user = generateValidUserData();
    const newUser = generateValidUserData();

    let addeduser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);

    expect(async () => await model.updateUser(addeduser._id, newUser.username, "f", newUser.status, newUser.firstName, newUser.lastName, newUser.biography, newUser.image)).rejects.toThrow();
})

/**
 * Creates a new user and the entries to update the with an invalid new status.
 * If all is as it should, an error is thrown.
 */
test("Updating a user with an invalid new status", async () => {
    const user = generateValidUserData();
    const newUser = generateValidUserData();

    let addeduser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);

    expect(async () => await model.updateUser(addeduser._id, newUser.username, newUser.password, "invalid status", newUser.firstName, newUser.lastName, newUser.biography, newUser.image)).rejects.toThrow();
})


/**
 * Creates a new user and the entries to update the with an invalid new first name.
 * If all is as it should, an error is thrown.
 */
test("Updating a user with an invalid new first name", async () => {
    const user = generateValidUserData();
    const newUser = generateValidUserData();

    let addeduser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);

    expect(async () => await model.updateUser(addeduser._id, newUser.username, newUser.password, newUser.status, null, newUser.lastName, newUser.biography, newUser.image)).rejects.toThrow();
})


/**
 * Creates a new user and the entries to update the with an invalid new last name.
 * If all is as it should, an error is thrown.
 */
test("Updating a user with an invalid new last name", async () => {
    const user = generateValidUserData();
    const newUser = generateValidUserData();

    let addeduser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);

    expect(async () => await model.updateUser(addeduser._id, newUser.username, newUser.password, newUser.status, newUser.firstName, null, newUser.biography, newUser.image)).rejects.toThrow();
})

/**
 * Creates a new user and the entries to update the with an invalid new biography.
 * If all is as it should, an error is thrown.
 */
test("Updating a user with an invalid new biography", async () => {
    const user = generateValidUserData();
    const newUser = generateValidUserData();

    let addeduser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);

    expect(async () => await model.updateUser(addeduser._id, newUser.username, newUser.password, newUser.status, newUser.firstName, newUser.lastName, undefined, newUser.image)).rejects.toThrow();
})


//TESTING DELETE USER

/**
 * This test adds a user to the database and then deletes them. To ensure they are actually
 * deleted it then tries to read them. If the read throws an error the user was deleted.
 */
test("Deleting a user from the database", async () => {
    const user = generateValidUserData();
    const addedUser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);
    await model.deleteUser(addedUser._id);
    expect(async () => await model.getUser(addedUser._id)).rejects.toThrow();
})

/**
 * In this test, a user is generated and then immediately deleted before being added to the database.
 * If the function works properly an error should be thrown.
 */
test("Deleting a user that does not exist in the database", async () => {
    expect(async () => await model.deleteUser("QTD19837510325")).rejects.toThrow();
});


test("Deleting a user when the database is inaccessible", async () => {
    const user = generateValidUserData();
    const addedUser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);

    await mongod.stop();

    expect(async () => await model.deleteUser("QTD19837510325")).rejects.toThrow();

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await initialize("Test_Message_App", url, true);
})