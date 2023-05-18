<<<<<<< HEAD
const app = require("../app"); 
const supertest = require("supertest");
const testRequest = supertest(app); 
const logger = require("../logs/logger");

require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
let model = require("../models/messageModel");
let userModel = require("../models/userModel");
let chatModel = require("../models/chatModel");
jest.setTimeout(500000);
let mongodb;


beforeAll(async () => {
    try {
        mongodb = await MongoMemoryServer.create();
        logger.info("Mock db started.");
    } catch(err) {
        logger.error(err.message);
    }
        
})

beforeEach(async () => {
    try {
        const url = mongodb.getUri();
        await model.initialize("Test_Message_App", url, true);
        await userModel.initialize("Test_Message_App", url, true);
        await chatModel.initialize("Test_Message_App", url, true);
    }
    catch(err) {
        logger.error("Could not initialize db in test: "+err.message);
    }
});

afterEach(async () => {
    try {
        await model.close();
        await userModel.close();
        await chatModel.close();
    }
    catch(err) {
        logger.error(err.message);
    }
});

afterAll(async () => {
    try {
        await mongodb.stop();
        logger.info("Mock db stopped.");
    }
    catch(err) {
        logger.error(err.message);
    }
})


    
//create
test("POST /messages success case", async () => {

    const messageBody = "hello!"

    //insert new user for authorId
    const authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    const userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    const chatId = (await chatModel.addChat(authorId, userId2))._id;

    const testResponse = await testRequest.post('/messages').send({
        messageBody: messageBody,
        authorId: authorId,
        chatId: chatId
    })

    cursor = await model.getCollection().find();
    results = await cursor.toArray();

    expect(testResponse.status).toBe(200);
    expect(results.length).toBe(1);
    expect(results[0].messageBody).toBe(messageBody);
    expect(results[0].authorId.toString()).toBe(authorId.toString());
    expect(results[0].chatId.toString()).toBe(chatId.toString());
});

test("POST /messages 400 fail case", async () => {

    //insert new user for authorId
    const authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    const userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    
    //insert new chat for chatId
    const chatId = (await chatModel.addChat(authorId, userId2))._id;
    
    const testResponse = await testRequest.post('/messages').send({
        messageBody: "",
        authorId: authorId,
        chatId: chatId
    })
    expect(testResponse.status).toBe(400);
});

test("POST /messages 500 fail case", async () => {

    const messageBody = "hello!"

    //insert new user for authorId
    const authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    const userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
        
    //insert new chat for chatId
    const chatId = (await chatModel.addChat(authorId, userId2))._id;
    
    model.close();
    const testResponse = await testRequest.post('/messages').send({
        messageBody: messageBody,
        authorId: authorId,
        chatId: chatId
    })
    expect(testResponse.status).toBe(500);

});
    
//read
test("GET /messages/:id 400 fail case", async () => {
    await model.getCollection().insertOne({messageBody: "hellooooo", authorId: 0, chatId: 0});
    const testResponse = await testRequest.get('/messages/' + "ffffffffffffffffffffffff");
    expect(testResponse.status).toBe(400);

});
    
test("GET /messages/:id 500 fail case", async () => {

    const messageBody = "hello!"

    //insert new user for authorId
    const authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    const userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
        
    //insert new chat for chatId
    const chatId = (await chatModel.addChat(authorId, userId2))._id;

    let messageId = (await model.postMessage(messageBody, authorId, chatId))._id;

    model.close();
    const testResponse = await testRequest.get('/messages/' + messageId);
    expect(testResponse.status).toBe(500);

});
    
test("GET /messages/:id success case", async () => {

    const messageBody = "hello!"

    //insert new user for authorId
    const authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    const userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
        
    //insert new chat for chatId
    const chatId = (await chatModel.addChat(authorId, userId2))._id;

    let messageId = (await model.postMessage(messageBody, authorId, chatId))._id;

    const testResponse = await testRequest.get('/messages/' + messageId);
    expect(testResponse.status).toBe(200);

});


test("GET /messages/ success case", async () => {
    const messageBody1 = "hello!";
    const messageBody2 = "testing";
    const messageBody3 = "HOPE IT WORKS";
    //insert new user for authorId
    const authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    const userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
        
    //insert new chat for chatId
    const chatId = (await chatModel.addChat(authorId, userId2))._id;

    await model.postMessage(messageBody1, authorId, chatId);
    await model.postMessage(messageBody2, authorId, chatId);
    await model.postMessage(messageBody3, authorId, chatId);

    const testResponse = await testRequest.get('/messages').send({
        chatId: chatId
    })
    
    //const testResponse = await JSON.parse(jsonResponse).toArray();

    expect(testResponse.status).toBe(200);
    expect(testResponse.body.length).toBe(3);

    expect(testResponse.body[0].messageBody).toBe(messageBody1);
    expect(testResponse.body[0].authorId.toString()).toBe(authorId.toString());
    expect(testResponse.body[0].chatId.toString()).toBe(chatId.toString());

    expect(testResponse.body[1].messageBody).toBe(messageBody2);
    expect(testResponse.body[1].authorId.toString()).toBe(authorId.toString());
    expect(testResponse.body[1].chatId.toString()).toBe(chatId.toString());

    expect(testResponse.body[2].messageBody).toBe(messageBody3);
    expect(testResponse.body[2].authorId.toString()).toBe(authorId.toString());
    expect(testResponse.body[2].chatId.toString()).toBe(chatId.toString());

});

test("GET /messages/ 500 fail case", async () => {
    const messageBody1 = "hello!";
    const messageBody2 = "testing";
    const messageBody3 = "HOPE IT WORKS";
    //insert new user for authorId
    const authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    const userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
        
    //insert new chat for chatId
    const chatId = (await chatModel.addChat(authorId, userId2))._id;

    await model.postMessage(messageBody1, authorId, chatId);
    await model.postMessage(messageBody2, authorId, chatId);
    await model.postMessage(messageBody3, authorId, chatId);

    model.close();
    const testResponse = await testRequest.get('/messages').send({
        chatId: chatId
    })

    expect(testResponse.status).toBe(500);

});

test("GET /messages/ 400 fail case", async () => {
    const testResponse = await testRequest.get('/messages').send({
        chatId: "ffffffffffffffffffffffff"
    })
    expect(testResponse.status).toBe(400);
});

//update
test("PUT /messages/ success case", async () => {
    const messageBody = "hello!";
    const newMessage = "world";

    //insert new user for authorId
    const authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    const userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    const chatId = (await chatModel.addChat(authorId, userId2))._id;

    const messageId = (await model.postMessage(messageBody, authorId, chatId))._id;

    const testResponse = await testRequest.put('/messages').send({
        messageId: messageId,
        messageBody: newMessage,
    })

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(200);
    expect(results.length).toBe(1);
    expect(results[0].messageBody).toBe(newMessage);
    expect(results[0].authorId.toString()).toBe(authorId.toString());
    expect(results[0].chatId.toString()).toBe(chatId.toString());
});

test("PUT /messages/ 500 fail case", async () => {
    const messageBody = "hello!";
    const newMessage = "world";

    //insert new user for authorId
    const authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    const userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    const chatId = (await chatModel.addChat(authorId, userId2))._id;

    const messageId = (await model.postMessage(messageBody, authorId, chatId))._id;

    model.close();

    const testResponse = await testRequest.put('/messages').send({
        messageId: messageId,
        messageBody: newMessage,
    })

    expect(testResponse.status).toBe(500);
});

test("PUT /messages/ 400 fail case", async () => {
    const badId = "ffffffffffffffffffffffff";
    const newMessage = "new message!!!";

    const testResponse = await testRequest.put('/messages').send({
        messageId: badId,
        messageBody: newMessage,
    })

    expect(testResponse.status).toBe(400);
});

//delete
test("DELETE /messages/success case", async () => {
    const messageBody1 = "hello!"
    const messageBody2 = "I like dogs!"
    const messageBody3 = "I hate dogs!"
    //insert new user for authorId
    const authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    const userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    const chatId = (await chatModel.addChat(authorId, userId2))._id;

    const messageId = (await model.postMessage(messageBody1, authorId, chatId))._id;
    await model.postMessage(messageBody2, authorId, chatId)
    await model.postMessage(messageBody3, authorId, chatId)

    const testResponse = await testRequest.delete('/messages').send({
        messageId: messageId
    })


    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(200);
    expect(results.length).toBe(2);
    expect(results[0].messageBody).toBe(messageBody2);

    expect(results[1].messageBody).toBe(messageBody3);

});

test("DELETE /messages/ 500 fail case", async () => {
    const messageBody = "hello!"
    //insert new user for authorId
    const authorId = (await userModel.addUser("username12", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;
    const userId2 = (await userModel.addUser("username21", "superSafePassword123", "online", "tester", "guy", "hello world", "sample"))._id;

    //insert new chat for chatId
    const chatId = (await chatModel.addChat(authorId, userId2))._id;

    const messageId = (await model.postMessage(messageBody, authorId, chatId))._id;

    model.close();
    const testResponse = await testRequest.delete('/messages').send({
        messageId: messageId
    })

    expect(testResponse.status).toBe(500);
});


=======
>>>>>>> 907602d3f2f72608bdd806b8578a661daa16ddbd
