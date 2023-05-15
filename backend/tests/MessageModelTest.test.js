require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
const { ObjectId } = require("mongodb");
let model = require("../models/messageModel");
let userModel = require("../models/userModel");
let chatModel = require("../models/chatModel");
jest.setTimeout(5000);
let mongodb;

beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    console.log("Mock db started.");
});

beforeEach(async () => {
    try {
        const url = mongodb.getUri();
        await model.initialize("Test_Message_App", url, true);
        await userModel.initialize("Test_Message_App", url, true);
        await chatModel.initialize("Test_Message_App", url, true);
    }
    catch(err) {
        console.log(err.message + "IN MESSAGESSS");
        logger.error(err.message + "IN MESSAGESSS");
    }
});

afterEach(async () => {
    try {
        await model.close();
        await userModel.close();
        await chatModel.close();
    }
    catch(err) {
        console.log(err.message);
    }
});

afterAll(async () => {
    await mongodb.stop();
    console.log("Mock db stopped.");
});
//CREATE

test('Can add message to DB', async () => {
    const messageBody = "hello!"

    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    await model.postMessage(messageBody, authorId, chatId);
    
    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == messageBody.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);
});
     
test("message at max characters passes", async () => {

    const messageBody = "expansedawdd galaxies collide, unveiling the secrets of the universe. Through the eons, civilizations rise and fall, leaving traces of their existence. We ponder the mysteries of life, searching for meaning in the infinite tapestry of time and space.";

    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    await model.postMessage(messageBody, authorId, chatId);
    
    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == messageBody.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);
});

test("message surpassing max characters throws", async () => {
    const MAX_CHAR = 250;
    const messageBody = "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth. Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life";

    //insert users
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;


    await expect(model.postMessage(messageBody, authorId, chatId))
    .rejects
    .toThrow("Message is over the character limit of " + MAX_CHAR);



});

test("Can't add empty message", async () => {
    const messageBody = ""

    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    await expect(model.postMessage(messageBody, authorId, chatId))
    .rejects
    .toThrow("Message cannot be empty");
});


//READ


//UPDATE


//DELETE
