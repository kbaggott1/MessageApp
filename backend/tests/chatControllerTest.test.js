const { MongoMemoryServer } = require('mongodb-memory-server');
const ChatsModelMongoDb = require('../models/chatModel');
const UserModelMongoDb = require("../models/userModel.js");
const request = require('supertest');
const app = require('../app'); 
jest.setTimeout(1000000);//Increase the timeout since the database connection may take time 5000
const testRequest = request(app);
const url = process.env.URL_PRE + process.env.MONGODB_PWD + process.env.URL_POST;

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

        await ChatsModelMongoDb.initialize(url,"Test_Message_App", true);
        await UserModelMongoDb.initialize("Test_Message_App", url, true);
        console.log("Mongo mock started!");
    }
    catch (err){
        console.log(err.message + "In chats");
    }
})

/**
 * Closes the connection to the database after each test.
 */
afterEach(async () => {
    await mongod.stop();
    console.log("Mongo mock connection stopped");
});

test("POST /chats success case", async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await UserModelMongoDb.addUser(user1.username, user1.password, user1.status, user1.firstName, user1.lastName, user1.biography, user1.image);
    const user2Response = await UserModelMongoDb.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);

    const chatResponse = await testRequest.post("/chats/").send({
        userSenderId: user1Response._id,
        userRecipientId: user2Response._id
    });

    const cursor = await ChatsModelMongoDb.getCollection().find();
    const results = await cursor.toArray();

    expect(chatResponse.status).toBe(200);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].userSenderId.toString()).toBe(user1Response._id.toString());
    expect(results[0].userRecipientId.toString()).toBe(user2Response._id.toString());
});

test("POST /chats failure invalid userSenderId failure case", async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await UserModelMongoDb.addUser(user1.username, user1.password, user1.status, user1.firstName, user1.lastName, user1.biography, user1.image);
    const user2Response = await UserModelMongoDb.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);

    const chatResponse = await testRequest.post("/chats/").send({
        userSenderId: null,
        userRecipientId: user2Response._id
    });

    const cursor = await ChatsModelMongoDb.getCollection().find();
    const results = await cursor.toArray();

    expect(chatResponse.status).toBe(400);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("POST /chats failure database error failure case", async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await UserModelMongoDb.addUser(user1.username, user1.password, user1.status, user1.firstName, user1.lastName, user1.biography, user1.image);
    const user2Response = await UserModelMongoDb.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);


    await mongod.stop();

    const testResponse = await testRequest.post("/chats/").send({
        userSenderId: user1Response._id,
        userRecipientId: user1Response._id
    });

    expect(testResponse.status).toBe(500);

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await ChatsModelMongoDb.initialize(url,"Test_Message_App", true);
});

test("GET /chats/:id success case", async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await UserModelMongoDb.addUser(user1.username, user1.password, user1.status, user1.firstName, user1.lastName, user1.biography, user1.image);
    const user2Response = await UserModelMongoDb.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);

    const addedChat = await ChatsModelMongoDb.addChat(user1Response._id, user2Response._id);

    const testResponse = await testRequest.get(`/chats/${addedChat.insertedId}`);

    expect(testResponse.status).toBe(200);
    expect(testResponse.body._id).toBe(addedChat.insertedId.toString());
    expect(testResponse.body.userSenderId).toBe(user1Response._id.toString());
    expect(testResponse.body.userRecipientId).toBe(user2Response._id.toString());
});


test("GET /chats/:id failure chat does not exist", async () => {
    const testResponse = await testRequest.get("/chats/87132568");

    expect(testResponse.status).toBe(500);
});

test("GET /chats/:id failure database error", async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await UserModelMongoDb.addUser(user1.username, user1.password, user1.status, user1.firstName, user1.lastName, user1.biography, user1.image);
    const user2Response = await UserModelMongoDb.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);

    const addedChat = await ChatsModelMongoDb.addChat(user1Response._id, user2Response._id);

    await mongod.stop();

    const testResponse = await testRequest.get(`/chats/${addedChat.insertedId}`);

    expect(testResponse.status).toBe(500);

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await ChatsModelMongoDb.initialize(url,"Test_Message_App", true);
});

test('GET /chats success case', async () => {
    const userArray = [];
    userArray[0] = generateValidUserData();
    userArray[1] = generateValidUserData();
    userArray[2] = generateValidUserData();
    userArray[3] = generateValidUserData();

    const userResponseArray = [];
    userResponseArray[0] = await UserModelMongoDb.addUser(userArray[0].username, userArray[0].password, userArray[0].status, userArray[0].firstName, userArray[0].lastName, userArray[0].biography, userArray[0].image);
    userResponseArray[1] = await UserModelMongoDb.addUser(userArray[1].username, userArray[1].password, userArray[1].status, userArray[1].firstName, userArray[1].lastName, userArray[1].biography, userArray[1].image);
    userResponseArray[2] = await UserModelMongoDb.addUser(userArray[2].username, userArray[2].password, userArray[2].status, userArray[2].firstName, userArray[2].lastName, userArray[2].biography, userArray[2].image);
    userResponseArray[3] = await UserModelMongoDb.addUser(userArray[3].username, userArray[3].password, userArray[3].status, userArray[3].firstName, userArray[3].lastName, userArray[3].biography, userArray[3].image);

    await ChatsModelMongoDb.addChat(userResponseArray[0]._id, userResponseArray[1]._id);
    await ChatsModelMongoDb.addChat(userResponseArray[1]._id, userResponseArray[2]._id);
    await ChatsModelMongoDb.addChat(userResponseArray[2]._id, userResponseArray[3]._id);
    await ChatsModelMongoDb.addChat(userResponseArray[3]._id, userResponseArray[0]._id);

    const testResponse = await testRequest.get("/chats/");
    expect(testResponse.status).toBe(200);

    const userIds = userResponseArray.map(user => String(user._id));

    for(let i = 0; i < testResponse.body.length; i++){
        const chat = testResponse.body[i];
        expect(chat.userSenderId).toBeDefined();
        expect(chat.userRecipientId).toBeDefined();
        expect(userIds.includes(String(chat.userSenderId))).toBe(true);
        expect(userIds.includes(String(chat.userRecipientId))).toBe(true);
    }

    expect(testResponse.body.length).toBe(userArray.length);
});



test('GET /chats failure no chats in the database', async () => {
    const testResponse = await testRequest.get("/chats/");
    expect(testResponse.status).toBe(400);
    
});

test('GET /chats failure database error', async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await UserModelMongoDb.addUser(user1.username, user1.password, user1.status, user1.firstName, user1.lastName, user1.biography, user1.image);
    const user2Response = await UserModelMongoDb.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);

    await ChatsModelMongoDb.addChat(user1Response._id, user2Response._id);

    await mongod.stop();

    const testResponse = await testRequest.get("/chats/");
    expect(testResponse.status).toBe(500);

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await ChatsModelMongoDb.initialize(url,"Test_Message_App", true);
});

test('DELETE /chats success case', async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await UserModelMongoDb.addUser(user1.username, user1.password, user1.status, user1.firstName, user1.lastName, user1.biography, user1.image);
    const user2Response = await UserModelMongoDb.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);

    const addedChat = await ChatsModelMongoDb.addChat(user1Response._id, user2Response._id);

    const testResponse = await testRequest.delete("/chats/").send({
        _id: addedChat._id
    });

    const cursor = await ChatsModelMongoDb.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(200);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test('DELETE /chats failure chat does not exist', async () => {
    const testResponse = await testRequest.delete("/chats/").send({
        chatId: "WF12085124",
    });

    const cursor = await ChatsModelMongoDb.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(400);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test('DELETE /chats failure database error', async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await UserModelMongoDb.addUser(user1.username, user1.password, user1.status, user1.firstName, user1.lastName, user1.biography, user1.image);
    const user2Response = await UserModelMongoDb.addUser(user2.username, user2.password, user2.status, user2.firstName, user2.lastName, user2.biography, user2.image);

    const addedChat = await ChatsModelMongoDb.addChat(user1Response._id, user2Response._id);
    await mongod.stop();

    const testResponse = await testRequest.delete("/chats/").send({
        _id: addedChat._id
    });

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await ChatsModelMongoDb.initialize(url,"Test_Message_App", true);

    expect(testResponse.status).toBe(500);
});

