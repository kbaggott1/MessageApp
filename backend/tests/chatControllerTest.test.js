const { MongoMemoryServer } = require('mongodb-memory-server');
const ChatsModelMongoDb = require('../models/chatModel');
const testRequest = require('supertest');
const app = require('../app');

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

test("POST /chats success case", async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await testRequest.post("/users/").send(user1);

    const user2Response = await testRequest.post("/users/").send(user2);

    const user1Id = user1Response.body.id;
    const user2Id = user2Response.body.id;

    const chatResponse = await testRequest.post("/chats/").send({
        userSenderId: user1Id,
        userRecipientId: user2Id
    });

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(chatResponse.status).toBe(200);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].userSenderId).toBe(user1Id);
    expect(results[0].userRecipientId).toBe(user2Id);
});

test("POST /chats failure invalid userSenderId failure case", async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await testRequest.post("/users/").send(user1);

    const user2Response = await testRequest.post("/users/").send(user2);

    const user1Id = user1Response.body.id;
    const user2Id = user2Response.body.id;

    const chatResponse = await testRequest.post("/chats/").send({
        userSenderId: null,
        userRecipientId: user2Id
    });

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(chatResponse.status).toBe(400);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("POST /chats failure database error failure case", async () => {
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await testRequest.post("/users/").send(user1);

    const user2Response = await testRequest.post("/users/").send(user2);

    const user1Id = user1Response.body.id;
    const user2Id = user2Response.body.id;

    await mongod.stop();

    const chatResponse = await testRequest.post("/chats/").send({
        userSenderId: user1Id,
        userRecipientId: user2Id
    });

    expect(chatResponse.status).toBe(500);

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await model.initialize("Test_Message_App", url, true);
});

test("GET /chats/:id success case", async () => {
    
    const user1 = generateValidUserData();
    const user2 = generateValidUserData();

    const user1Response = await testRequest.post("/users/").send(user1);

    const user2Response = await testRequest.post("/users/").send(user2);

    const user1Id = user1Response.body.id;
    const user2Id = user2Response.body.id;

    const addedChat = await model.addChat(user1Id, user2Id);

    const testResponse = await testRequest.get(`/chats/${addedChat._id}`);

    expect(testResponse.status).toBe(200);
    expect(testResponse.body._id).toBe(addedChat._id.toString());
    expect(testResponse.body.userSenderId).toBe(user1Id);
    expect(testResponse.body.userRecipientId).toBe(user2Id);
    
});

test("GET /chats/:id failure chat does not exist", async () => {
    const testResponse = await testRequest.get("/chats/87132568");

    expect(testResponse.status).toBe(400);
});

test("GET /chats/:id failure database error", async () => {
    const senderId = generateValidUserId();
    const recipientId = generateValidUserId();
    addedChat = await model.addChat(senderId, recipientId);
    await mongod.stop();

    const testResponse = await testRequest.get(`/chats/${addedChat._id}`);
    expect(testResponse.status).toBe(500);

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await model.initialize("Test_Message_App", url, true);
});

test('GET /chats success case', async () => {
    const chatArray = [];
    chatArray[0] = { userSenderId: generateValidUserId(), userRecipientId: generateValidUserId() };
    chatArray[1] = { userSenderId: generateValidUserId(), userRecipientId: generateValidUserId() };
    chatArray[2] = { userSenderId: generateValidUserId(), userRecipientId: generateValidUserId() };
    chatArray[3] = { userSenderId: generateValidUserId(), userRecipientId: generateValidUserId() };
    
    await model.addChat(chatArray[0].userSenderId, chatArray[0].userRecipientId);
    await model.addChat(chatArray[1].userSenderId, chatArray[1].userRecipientId);
    await model.addChat(chatArray[2].userSenderId, chatArray[2].userRecipientId);
    await model.addChat(chatArray[3].userSenderId, chatArray[3].userRecipientId);

    const testResponse = await testRequest.get("/chats/");
    expect(testResponse.status).toBe(200);

    for(let i = 0; i < chatArray.length; i++){
        expect(chatArray[i].userSenderId == testResponse.body[i].userSenderId).toBe(true)
        expect(chatArray[i].userRecipientId == testResponse.body[i].userRecipientId).toBe(true)
    }

    expect(testResponse.body.length == chatArray.length).toBe(true)
})

test('GET /chats failure no chats in the database', async () => {
    const testResponse = await testRequest.get("/chats/");
    expect(testResponse.status).toBe(400);
});

test('GET /chats failure database error', async () => {
    const sender1Id = generateValidUserId();
    const recipient1Id = generateValidUserId();
    const sender2Id = generateValidUserId();
    const recipient2Id = generateValidUserId();
    
    await model.addChat(sender1Id, recipient1Id);
    await model.addChat(sender2Id, recipient2Id);

    await mongod.stop();

    const testResponse = await testRequest.get("/chats/");
    expect(testResponse.status).toBe(500);

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await model.initialize("Test_Message_App", url, true);
});

test('DELETE /chats success case', async () => {
    const senderId = generateValidUserId();
    const recipientId = generateValidUserId();
    const addedChat = await model.addChat(senderId, recipientId);

    const testResponse = await testRequest.delete("/chats/").send({
        chatId: addedChat._id
    });

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(200);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test('DELETE /chats failure chat does not exist', async () => {
    const testResponse = await testRequest.delete("/chats/").send({
        chatId: "WF12085124",
    });

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(500);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test('DELETE /chats failure database error', async () => {
    const senderId = generateValidUserId();
    const recipientId = generateValidUserId();
    const addedChat = await model.addChat(senderId, recipientId);
    await mongod.stop();
    
    const testResponse = await testRequest.delete("/chats/").send({
        chatId: addedChat._id,
    });

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await model.initialize("Test_Message_App", url, true);

    expect(testResponse.status).toBe(500);
});

