require('dotenv').config();
jest.setTimeout(10000);
const { MongoMemoryServer } = require('mongodb-memory-server');
const chatModel = require("../models/chatModel.js");
const userModel = require("../models/userModel.js");
const { initialize } = require('../models/chatModel.js');
const utils = require("../helperMethods/validateUtilsChatModel.js");
const {InvalidInputError} = require("../models/InvalidInputError");

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

test("Adding chat with valid user data", async () => {
    const user = generateValidUserData();
    const user2 = generateValidUserData();

    let addedUser1 = await userModel.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);
    let addedUser2 = await userModel.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);
    
    let addedChat = await chatModel.addChat(addedUser1._id, addedUser2._id);

    let retrievedChat = await chatModel.getSingleChat(addedChat.insertedId);
    expect(retrievedChat.userSenderId.toString()).toBe(addedUser1._id.toString());
    expect(retrievedChat.userRecipientId.toString()).toBe(addedUser2._id.toString());
});

test("Adding chat with invalid user data", async () => {
    const invalidUserId1 = null;
    const invalidUserId2 = null;

    await expect(chatModel.addChat(invalidUserId1, invalidUserId2)).rejects.toThrow(chatModel.InvalidInputError);

    const addedChat = await chatModel.addChat(invalidUserId1, invalidUserId2).catch(() => null);

    if (addedChat) {
        const foundChat = await chatModel.getSingleChat(addedChat.insertedId).catch(() => null);

        expect(foundChat).toBeNull();
    } else {
        expect(addedChat).toBeNull();
    }
});

test("Get single chat from the database", async () => {
    const user = generateValidUserData();

    let addedUser1 = await userModel.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);
    let addedUser2 = await userModel.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);

    const addedChat = await chatModel.addChat(addedUser1.insertedId);

    const foundChat = await chatModel.getSingleChat(addedChat.insertedId);

    expect(foundChat.userSenderId).toEqual(addedUser1.insertedId);
    expect(foundChat.userRecipientId).toEqual(addedUser2.insertedId);
});

test("Get single chat with invalid ID", async () => {
    const invalidId = null;
    await expect(chatModel.getSingleChat(invalidId)).rejects.toThrow(chatModel.InvalidInputError);
});

test("Delete chat successfully", async () => {
    const user = generateValidUserData();
    const user2 = generateValidUserData();

    const addedUser1 = await userModel.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);
    const addedUser2 = await userModel.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);

    const addedChat = await chatModel.addChat(addedUser1._id, addedUser2._id);

    const deletedChat = await chatModel.deleteChat(addedChat.insertedId);

    expect(deletedChat._id).toEqual(addedChat.insertedId);

    await expect(chatModel.getSingleChat(deletedChat._id)).rejects.toThrow(chatModel.InvalidInputError);
});

test("Delete chat with invalid ID", async () => {
    const invalidId = null;
    await expect(chatModel.deleteChat(invalidId)).rejects.toThrow(chatModel.InvalidInputError);
});

test("Get all chats successfully", async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();
    const user3 = generateValidUserData();
    const user4 = generateValidUserData();

    const addedUser1 = await userModel.addUser(user1.username, user1.password, user1.status, user1.firstName, user1.lastName, user1.biography, user1.image);
    const addedUser2 = await userModel.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);
    const addedUser3 = await userModel.addUser(user3.username, user3.password, user3.status, user3.firstName, user3.lastName, user3.biography, user3.image);
    const addedUser4 = await userModel.addUser(user4.username, user4.password, user4.status, user4.firstName, user4.lastName, user4.biography, user4.image);

    const addedChat1 = await chatModel.addChat(addedUser1._id, addedUser2._id);
    const addedChat2 = await chatModel.addChat(addedUser3._id, addedUser4._id);

    const allChats = await chatModel.getAllChats();

    expect(allChats.length).toBe(2);

    expect(allChats.some(chat => chat._id.toString() === addedChat1.insertedId.toString())).toBeTruthy();
    expect(allChats.some(chat => chat._id.toString() === addedChat2.insertedId.toString())).toBeTruthy();
});

test("Get all chats when there are no chats in the database", async () => {
    await chatModel.chatCollection.deleteMany({});

    const allChats = await chatModel.getAllChats();

    expect(allChats.length).toBe(0);
});