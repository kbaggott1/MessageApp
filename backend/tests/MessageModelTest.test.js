require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
const { ObjectId } = require("mongodb");
let model = require("../models/messageModel");
let userModel = require("../models/userModel");
let chatModel = require("../models/chatModel");
const logger = require("../logs/logger");
const exp = require("constants");
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

test('ADD: Can add message to DB', async () => {
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
     
test("ADD: message at max characters passes", async () => {
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

test("ADD: message surpassing max characters throws", async () => {
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

test("ADD: Can't add empty message", async () => {
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


test("ADD: Invalid chatId throws", async () => {
    const messageBody = "hello there";

    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = "FFFFFFFFFFFFFFFFFFFFFFFF";

    await expect(model.postMessage(messageBody, authorId, chatId))
    .rejects
    .toThrow("ChatId does not exist.");
});


test("ADD: Invalid authorId throws", async () => {
    const messageBody = "hello there";

    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    let badAuthId = "FFFFFFFFFFFFFFFFFFFFFFFF";

    await expect(model.postMessage(messageBody, badAuthId, chatId))
    .rejects
    .toThrow("AuthorId does not exist.");
});


//READ
test('READ: Can read message by id from DB', async () => {
    const messageBody = "hello!"

    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    let messageId = (await model.postMessage(messageBody, authorId, chatId))._id;
    
    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == messageBody.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);

    //AFTER SUCCESFULLY ADDING TO DB

    let message = await model.getMessageById(messageId);

    expect(results[0].messageBody == message.messageBody).toBe(true);
    expect(results[0].authorId.toString() == message.authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == message.chatId.toString()).toBe(true);
});

test('READ: Read message by id doesn\'t throws with bad id from DB', async () => {

    //AFTER SUCCESFULLY ADDING TO DB

    let badMessageId = "ffffffffffffffffffffffff";

    await expect(model.getMessageById(badMessageId))
    .rejects
    .toThrow("Could not find message with id: " + badMessageId);

});


//READ
test('READ: Can read message by chat id from DB', async () => {
    const messageBody1 = "hello";
    const messageBody2 = "world!";
    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    let message = await model.postMessage(messageBody1, authorId, chatId);
    let message2 = await model.postMessage(messageBody2, authorId, chatId);
    
    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(2);
    expect(results[0].messageBody.toLowerCase() == messageBody1.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);

    expect(results[1].messageBody.toLowerCase() == messageBody2.toLowerCase()).toBe(true);

    expect(results[1].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[1].chatId.toString() == chatId.toString()).toBe(true);

    //AFTER SUCCESFULLY ADDING TO DB

    let messages = await model.getMessagesByChatId(chatId);

    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBe(2);

    expect(results[0].messageBody == messages[0].messageBody).toBe(true);
    expect(results[0].authorId.toString() == messages[0].authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == messages[0].chatId.toString()).toBe(true);

    expect(results[1].messageBody == messages[1].messageBody).toBe(true);
    expect(results[1].authorId.toString() == messages[1].authorId.toString()).toBe(true);
    expect(results[1].chatId.toString() == messages[1].chatId.toString()).toBe(true);
});

test('READ: Can read message by chat id throws with bad id from DB', async () => {
    let badChatId = "ffffffffffffffffffffffff";

    let messages = await model.getMessagesByChatId(badChatId);

    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length == 0);

});

//UPDATE

test('UPDATE: Can update message in DB', async () => {
    const messageBody = "hello";
    const newMessage = "world!";
    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    let messageId = (await model.postMessage(messageBody, authorId, chatId))._id;
    
    let cursor = await model.getCollection().find();
    let results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == messageBody.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);

    //AFTER SUCCESFULLY ADDING TO DB

    await model.editMessage(messageId, newMessage);

    cursor = await model.getCollection().find();
    results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == newMessage.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);
});

test('UPDATE: Can update message in DB with exact char limit', async () => {
    const messageBody = "hello";
    const newMessage = "expansedawdd galaxies collide, unveiling the secrets of the universe. Through the eons, civilizations rise and fall, leaving traces of their existence. We ponder the mysteries of life, searching for meaning in the infinite tapestry of time and space.";
    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    let messageId = (await model.postMessage(messageBody, authorId, chatId))._id;
    
    let cursor = await model.getCollection().find();
    let results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == messageBody.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);

    //AFTER SUCCESFULLY ADDING TO DB

    await model.editMessage(messageId, newMessage);

    cursor = await model.getCollection().find();
    results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == newMessage.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);
});



test('UPDATE: Update message in DB throws with empty message', async () => {
    const messageBody = "hello";
    const newMessage = "";
    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    let messageId = (await model.postMessage(messageBody, authorId, chatId))._id;
    
    let cursor = await model.getCollection().find();
    let results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == messageBody.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);

    //AFTER SUCCESFULLY ADDING TO DB

    await expect(model.editMessage(messageId, newMessage))
    .rejects
    .toThrow("Message cannot be empty");

});

test('UPDATE: Update message in DB throws with message over character limit', async () => {
    const MAX_CHAR = 250;
    const messageBody = "hello";
    const newMessage = "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth. Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life";
    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    let messageId = (await model.postMessage(messageBody, authorId, chatId))._id;
    
    let cursor = await model.getCollection().find();
    let results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == messageBody.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);

    //AFTER SUCCESFULLY ADDING TO DB

    await expect(model.editMessage(messageId, newMessage))
    .rejects
    .toThrow("Message is over the character limit of " + MAX_CHAR);

});

//DELETE

test('DELETE: Can delete message from DB', async () => {
    const messageBody = "hello!"

    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    let messageId = (await model.postMessage(messageBody, authorId, chatId))._id;
    
    let cursor = await model.getCollection().find();
    let results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == messageBody.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);

    //AFTER SUCCESFULLY ADDING TO DB

    await model.deleteMessageById(messageId);

    cursor = await model.getCollection().find();
    results = await cursor.toArray();
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test('DELETE: Deletes right message from DB', async () => {
    const messageBody1 = "hello";
    const messageBody2 = "world!";

    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    let messageId = (await model.postMessage(messageBody1, authorId, chatId))._id;
    await model.postMessage(messageBody2, authorId, chatId);
    
    let cursor = await model.getCollection().find();
    let results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(2);

    expect(results[0].messageBody.toLowerCase() == messageBody1.toLowerCase()).toBe(true);
    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);

    expect(results[1].messageBody.toLowerCase() == messageBody2.toLowerCase()).toBe(true);
    expect(results[1].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[1].chatId.toString() == chatId.toString()).toBe(true);

    //AFTER SUCCESFULLY ADDING TO DB

    await model.deleteMessageById(messageId);

    cursor = await model.getCollection().find();
    results = await cursor.toArray();
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == messageBody2.toLowerCase()).toBe(true);
    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);
});

test('DELETE: Delete message from DB with bad Id doesnt throw', async () => {
    const messageBody = "hello!"

    //insert new user for authorId
    let authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    let userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    let chatId = (await chatModel.addChat(authorId, userId2))._id;

    await model.postMessage(messageBody, authorId, chatId);


    
    let cursor = await model.getCollection().find();
    let results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == messageBody.toLowerCase()).toBe(true);

    expect(results[0].authorId.toString() == authorId.toString()).toBe(true);
    expect(results[0].chatId.toString() == chatId.toString()).toBe(true);

    //AFTER SUCCESFULLY ADDING TO DB


    let badMessageId = "ffffffffffffffffffffffff";
    await model.deleteMessageById(badMessageId);

    cursor = await model.getCollection().find();
    results = await cursor.toArray();
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
});