require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
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
        await model.initialize("messages_db_test", url, true);
    }
    catch(err) {
        console.log(err.message + "IN MESSAGESSS");
    }
});

afterEach(async () => {
    try {
        await model.close();
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
    let authorId = await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample");
    let userId2 = await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample")._id;

    //insert new chat for chatId
    let chatId = await chatModel.addChat(authorId, userId2)._id;

    await model.postMessage(messageBody, authorId, chatId);
    
    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].messageBody.toLowerCase() == messageBody.toLowerCase()).toBe(true);
    expect(results[0].authorId == authorId).toBe(true);
    expect(results[0].chatId == chatId).toBe(true);
});
     

test("Invalid id throws", async () => {
    const id = "34abc", message = "hello!", user = "kbaggott";

    await expect(model.postMessage(id, message, user))
    .rejects
    .toThrow("Invalid id: " + id + ". Ids must be numeric.");
});

test("Empty message throws", async () => {
    const id = "12", message = "", user = "bigdude33";

    await expect(model.postMessage(id, message, user))
    .rejects
    .toThrow("Message cannot be empty");
});

test("message surpassing max characters throws", async () => {
    const MAX_CHAR = 500;

    const id = "12", message = "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth. Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life", 
    user = "bigdude33";


    await expect(model.postMessage(id, message, user))
    .rejects
    .toThrow("Message is over the character limit of " + MAX_CHAR);
});


test("Illegal username throws", async () => {
    const id = "12", message = "blue", user = "???!1!!!!";

    await expect(model.postMessage(id, message, user))
    .rejects
    .toThrow("Illegal characters in username: " + user);
});
//READ

test("Get message by id", async () => {
    const id = "1", message = "message1", user = "helloooo";

    await model.postMessage(id, message, user);
    await model.postMessage(id2, message2, user);

    const results = await collectionFindArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(2);


    await expect(model.getMessageById(id)).resolves.toHaveProperty("message", message);
    await expect(model.getMessageById(id2)).resolves.toHaveProperty("message", message2);

});

test("getMessageById throws when id isn't in the db", async () => {

    await model.postMessage("1", "goodie", "kirby55");

    const results = await collectionFindArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);


    await expect(model.getMessageById("2"))
    .rejects
    .toThrow("Could not find message with id: 2");
});

test("Get all messages by username", async () => {
    const id = "1", message = "testing 12345", user = "helloooo";
    const id2 = "2", message2 = "test for diff";
    const id3 = "3", user2 = "ldutton";

    await model.postMessage(id, message, user);
    await model.postMessage(id2, message2, user);
    await model.postMessage(id3, message, user2);

    const results = await collectionFindArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(3);

    const userPosts = await model.getMessagesByUser(user);

    expect(userPosts.length).toBe(2);

    expect(userPosts[0].user).toBe(user);
    expect(userPosts[0].message).toBe(message);

    expect(userPosts[1].user).toBe(user);
    expect(userPosts[1].message).toBe(message2);
});


test("Get all messages", async () => {
    const id = "1", message = "message1", user = "helloooo";
    const id2 = "2", message2 = "message2", user2 = "genericUser";
    const id3 = "3", message3 = "message3", user3 = "batman29";
    const id4 = "4", message4 = "message4", user4 = "JavaScriptSucks";

    await model.postMessage(id, message, user);
    await model.postMessage(id2, message2, user2);
    await model.postMessage(id3, message3, user3);
    await model.postMessage(id4, message4, user4);

    const results = await collectionFindArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(4);


    const allMessages = await model.getAllMessages();

    expect(allMessages.length).toBe(4);

    expect(allMessages[0].user).toBe(user);
    expect(allMessages[1].user).toBe(user2);
    expect(allMessages[2].user).toBe(user3);
    expect(allMessages[3].user).toBe(user4);

});

//UPDATE

test("Edit message", async () => {
    const id = "1", message = "message1", user = "helloooo";
    const id2 = "2", message2 = "message2", user2 = "genericUser";

    await model.postMessage(id, message, user);
    await model.postMessage(id2, message, user2);

    let results = await collectionFindArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(2);

    expect(results[0].message).toBe(message);
    expect(results[1].message).toBe(message);

    await model.editMessage(id, message2);

    results = await collectionFindArray();

    expect(results[0].message).toBe(message2);
    expect(results[1].message).toBe(message);
   

});

test("editMessage throws when message does not exist", async () => {
    const id = "1", message = "message1", user = "helloooo";

    await model.postMessage(id, message, user);

    let results = await collectionFindArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(results[0].message).toBe(message);

    await model.editMessage(id, "message has changed");

    results = await collectionFindArray();

    expect(results[0].message).toBe("message has changed");
    
    await expect(model.editMessage("2", "this should throw"))
    .rejects
    .toThrow("Message id: 2 does not exist.");

});

//DELETE

test("Delete message from database", async () => {
    const id = "1", message = "testing 12345", user = "helloooo";
    const id2 = "2", message2 = "test for diff";
    const id3 = "3", user2 = "ldutton";

    await model.postMessage(id, message, user);
    await model.postMessage(id2, message2, user);
    await model.postMessage(id3, message, user2);

    let results = await collectionFindArray();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(3);

    await model.deleteMessageById(id);

    results = await collectionFindArray();
    expect(results.length).toBe(2);

    expect(results[0].messageId).toBe(id2);
    expect(results[1].messageId).toBe(id3);
});


async function collectionFindArray() {
    return await model.getCollection().find().toArray();
}