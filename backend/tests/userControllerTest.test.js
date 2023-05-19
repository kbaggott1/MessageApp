
require('dotenv').config();
jest.setTimeout(1000000);//Increase the timeout since the database connection may take time 5000
const { MongoMemoryServer } = require('mongodb-memory-server');
const model = require("../models/userModel.js");
const app = require("../app.js");
const supertest = require("supertest");
const testRequest = supertest(app);
const { Session, createSession, getSession, deleteSession } = require("../models/Session.js");


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
const generateUserData = () => userData.splice(Math.floor(Math.random() * userData.length), 1)[0];

let mongod;

/**
 * This resets the database before each test
 */
beforeEach(async () => {
    try {
        mongod = await MongoMemoryServer.create();
        const url = await mongod.getUri();

        await model.initialize("Test_Message_App", url, true);
        //console.log("Mongo mock started!");
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
    //console.log("Mongo mock connection stopped");
});




//TESTING POST

/**
 * Tests a successful case of creating a user. Valid username and password are provided to the url.
 * Expected response status is 200. The collection of users is then pulled and the test verifies if the
 * new user is present in the collection.
 */
test("POST /users success case", async () => {
    const sessionId = createSession("Yano", 5);

    const { username, password, status, firstName, lastName, biography, image } = generateUserData();
    const testResponse = await testRequest.post("/users/").set("sessionId", sessionId).send({
        username: username,
        password: password,
        status: status,
        firstName: firstName,
        lastName: lastName,
        biography: biography,
        image: image
    }).set("Cookie", "sessionId="+sessionId);;

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();
    
    expect(testResponse.status).toBe(200);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].username.toLowerCase() == username.toLowerCase()).toBe(true);
});

/**
 * Test for an invalid username post. Test provides an invalid username to the url and expects that
 * the status code returned should be 404.
 */
test("POST /users failure invalid username failure case", async () =>{
    const sessionId = createSession("Yano", 5);

    const { username, password, status, firstName, lastName, biography, image } = generateUserData();
    const testResponse = await testRequest.post("/users/").send({
        username: null,
        password: password,
        status: status,
        firstName: firstName,
        lastName: lastName,
        biography: biography,
        image: image
    }).set("Cookie", "sessionId="+sessionId);;

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(400);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

/**
 * Test for an invalid password post. Test provides an invalid password to the url and expects that
 * the status code returned should be 400.
 */
test("POST /users failure invalid password failure case", async () => {
    const sessionId = createSession("Yano", 5);

    const { username, password, status, firstName, lastName, biography, image } = generateUserData();
    const testResponse = await testRequest.post("/users/").send({
        username: username,
        password: undefined,
        status: status,
        firstName: firstName,
        lastName: lastName,
        biography: biography,
        image: image
    }).set("Cookie", "sessionId="+sessionId);;

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(400);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
})

/**
 * Tests for a database issue while attempting to add a new valid user to the database. This is done by 
 * severing the connection to the database followed by trying to post the user. The test then verifies
 * the status code of the response is 500 and then re-establishes the connection to the database
 */
test("POST /users failure database error failure case", async () =>{
    const sessionId = createSession("Yano", 5);

    const { username, password, status, firstName, lastName, biography, image } = generateUserData();
    await mongod.stop();

    const testResponse = await testRequest.post("/users/").send({
        username: username,
        password: password,
        status: status,
        firstName: firstName,
        lastName: lastName,
        biography: biography,
        image: image
    }).set("Cookie", "sessionId="+sessionId);;

    expect(testResponse.status).toBe(500);

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await model.initialize("Test_Message_App", url, true);
})



//TESTING GET

/**
 * This tests adds a user to the database from the list of valid users and then
 * tries to read the user. The test then checks the status code returned and if
 * the json object contains the correct username and password.
 */
test("GET /users/user success case", async () => {
    const sessionId = createSession("Yano", 5);
    
    const { username, password, status, firstName, lastName, biography, image } = generateUserData();
    const addedUser = await model.addUser(username, password, status, firstName, lastName, biography, image);

    const testResponse = await testRequest.get("/users/user/" + addedUser._id).set("Cookie", "sessionId="+sessionId);;

    expect(testResponse.status).toBe(200);
    expect(testResponse.body._id).toBe(addedUser._id.toString());
    expect(testResponse.body.username).toBe(username);
    expect(testResponse.body.status).toBe(status);
    expect(testResponse.body.firstName).toBe(firstName);
    expect(testResponse.body.lastName).toBe(lastName);
    expect(testResponse.body.biography).toBe(biography);
    expect(testResponse.body.image).toBe(image);
    
})

/**
 * Test that the appropriate error status and message are returned when searching
 * for a user that does not exist
 */
test("GET /users/user failure user does not exist", async () => {
    const testResponse = await testRequest.get("/users/user/" + "87132568");

    expect(testResponse.status).toBe(500);
})

/**
 * Tests that the get method returns the appropriate error code and message
 * when the database has failed
 */
test("GET /users/user failure database error", async () => {
    const sessionId = createSession("Yano", 5);

    const { username, password, status, firstName, lastName, biography, image } = generateUserData();
    addedUser = await model.addUser(username, password, status, firstName, lastName, biography, image);
    await mongod.stop();

    const testResponse = await testRequest.get("/users/user/" + addedUser._id).set("Cookie", "sessionId="+sessionId);;
    expect(testResponse.status).toBe(500);

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await model.initialize("Test_Message_App", url, true);
})



//TESTING GET ALL

/**
 * Tests retrieving all users. First 4 users are added to the database and then
 * the request is sent. The request body is compared with those previously added
 * and the status code is expected to be 200 as well.
 */
test('GET /users success case', async () =>{
    const sessionId = createSession("Yano", 5);

    const userArray = [];
    userArray[0] = generateUserData();
    userArray[1] = generateUserData();
    userArray[2] = generateUserData();
    userArray[3] = generateUserData();
    await model.addUser(userArray[0].username, userArray[0].password, userArray[0].status, userArray[0].firstName, userArray[0].lastName, userArray[0].biography, userArray[0].image);
    await model.addUser(userArray[1].username, userArray[1].password, userArray[1].status, userArray[1].firstName, userArray[1].lastName, userArray[1].biography, userArray[1].image);
    await model.addUser(userArray[2].username, userArray[2].password, userArray[2].status, userArray[2].firstName, userArray[2].lastName, userArray[2].biography, userArray[2].image);
    await model.addUser(userArray[3].username, userArray[3].password, userArray[3].status, userArray[3].firstName, userArray[3].lastName, userArray[3].biography, userArray[3].image);

    const testResponse = await testRequest.get("/users/").set("Cookie", "sessionId="+sessionId);
    expect(testResponse.status).toBe(200);

    for(let i = 0; i < userArray.length; i++){
        expect(userArray[i].username == testResponse.body[i].username).toBe(true)
        expect(userArray[i].status == testResponse.body[i].status).toBe(true)
        expect(userArray[i].firstName == testResponse.body[i].firstName).toBe(true)
        expect(userArray[i].lastName == testResponse.body[i].lastName).toBe(true)
        expect(userArray[i].biography == testResponse.body[i].biography).toBe(true)
        expect(userArray[i].image == testResponse.body[i].image).toBe(true)
    }

    expect(testResponse.body.length == userArray.length).toBe(true)
})

/**
 * Tests trying to read all users from the database when there are no users. The
 * test simply tries the read and then verifies the correct 400 level status code
 * is present in the response.
 */
test('GET /users failure no users in the database', async () => {
    const sessionId = createSession("Yano", 5);

    const testResponse = await testRequest.get("/users/").set("Cookie", "sessionId="+sessionId);
    expect(testResponse.status).toBe(400);
})

/**
 * Tests that the get all users operation fails gracefully when there is a database error.
 * The test users are added and the database is turned off. The test simply checks for
 * the correct error code to make sure the program didn't misinterpret the error.
 */
test('GET /users failure database error', async () => {
    const sessionId = createSession("Yano", 5);

    const userArray = [];
    userArray[0] = generateUserData();
    userArray[1] = generateUserData();
    userArray[2] = generateUserData();
    userArray[3] = generateUserData();
    await model.addUser(userArray[0].username, userArray[0].password, userArray[0].status, userArray[0].firstName, userArray[0].lastName, userArray[0].biography, userArray[0].image);
    await model.addUser(userArray[1].username, userArray[1].password, userArray[1].status, userArray[1].firstName, userArray[1].lastName, userArray[1].biography, userArray[1].image);
    await model.addUser(userArray[2].username, userArray[2].password, userArray[2].status, userArray[2].firstName, userArray[2].lastName, userArray[2].biography, userArray[2].image);
    await model.addUser(userArray[3].username, userArray[3].password, userArray[3].status, userArray[3].firstName, userArray[3].lastName, userArray[3].biography, userArray[3].image);
    
    await mongod.stop();

    const testResponse = await testRequest.get("/users/").set("Cookie", "sessionId="+sessionId);;
    expect(testResponse.status).toBe(500);

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await model.initialize("Test_Message_App", url, true);
})



//TESTING UPDATE

/**
 * Tests a successful update operation by adding a valid user to the database and then updating them
 * with new valid data. The status is checked followed by finding the new user in the database and
 * checking to see if their username and password are the new ones.
 */
test('PUT /users success case', async () =>{
    const sessionId = createSession("Yano", 5);

    const oldUser = generateUserData();
    const newUser = generateUserData();
    const addedUser = await model.addUser(oldUser.username, oldUser.password, oldUser.status, oldUser.firstName, oldUser.lastName, oldUser.biography, oldUser.image);

    const testResponse = await testRequest.put("/users/").send({
        userId: addedUser._id,
        username: newUser.username,
        password: newUser.password,
        status: newUser.status,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        biography: newUser.biography,
        image: newUser.image
    }).set("Cookie", "sessionId="+sessionId);;
    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(200);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(testResponse.body.username == newUser.username).toBe(true);
    expect(testResponse.body.status == newUser.status).toBe(true);
    expect(testResponse.body.firstName == newUser.firstName).toBe(true);
    expect(testResponse.body.lastName == newUser.lastName).toBe(true);
    expect(testResponse.body.biography == newUser.biography).toBe(true);
    expect(testResponse.body.image == newUser.image).toBe(true);
    expect(results[0].username == newUser.username).toBe(true);
    expect(results[0].status == newUser.status).toBe(true);
    expect(results[0].firstName == newUser.firstName).toBe(true);
    expect(results[0].lastName == newUser.lastName).toBe(true);
    expect(results[0].biography == newUser.biography).toBe(true);
    expect(results[0].image == newUser.image).toBe(true);
})

/**
 * Tests an update failure case by adding a new user to the database and then
 * trying to update them with a new and invalid username. The test expects the 
 * response to have a 400 status and that the old user should not be updated.
 */
test('PUT /users failure invalid username', async () => {
    const sessionId = createSession("Yano", 5);

    const oldUser = generateUserData();
    const newUser = { username: "", password: 'Password123', status:'offline', firstName: 'John', lastName: 'Doe', biography:'This is a test', image:'placeholder'};
    const addedUser = await model.addUser(oldUser.username, oldUser.password, oldUser.status, oldUser.firstName, oldUser.lastName, oldUser.biography, oldUser.image);

    const testResponse = await testRequest.put("/users/").send({
        userId: addedUser._id,
        username: newUser.username,
        password: newUser.password,
        status: newUser.status,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        biography: newUser.biography,
        image: newUser.image
    }).set("Cookie", "sessionId="+sessionId);


    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(400);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].username == oldUser.username).toBe(true);
    expect(results[0].status == oldUser.status).toBe(true);
    expect(results[0].firstName == oldUser.firstName).toBe(true);
    expect(results[0].lastName == oldUser.lastName).toBe(true);
    expect(results[0].biography == oldUser.biography).toBe(true);
    expect(results[0].image == oldUser.image).toBe(true);
})

/**
 * Tests an update failure case by adding a new user to the database and then
 * trying to update them with a new and invalid password. The test expects the 
 * response to have a 400 status and that the old user should not be updated.
 */
test('PUT /users failure invalid password', async () => {
    const sessionId = createSession("Yano", 5);

    const oldUser = generateUserData();
    const newUser = { username: 'username', password: null, status:'offline', firstName: 'John', lastName: 'Doe', biography:'This is a test', image:'placeholder'};
    const addedUser = await model.addUser(oldUser.username, oldUser.password, oldUser.status, oldUser.firstName, oldUser.lastName, oldUser.biography, oldUser.image);

    const testResponse = await testRequest.put("/users/").send({
        userId: addedUser._id,
        username: newUser.username,
        password: newUser.password,
        status: newUser.status,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        biography: newUser.biography,
        image: newUser.image
    }).set("Cookie", "sessionId="+sessionId);

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(400);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].username == oldUser.username).toBe(true);
    expect(results[0].status == oldUser.status).toBe(true);
    expect(results[0].firstName == oldUser.firstName).toBe(true);
    expect(results[0].lastName == oldUser.lastName).toBe(true);
    expect(results[0].biography == oldUser.biography).toBe(true);
    expect(results[0].image == oldUser.image).toBe(true);
})

/**
 * Verifies that the correct error is thrown and that no user is added when trying
 * to update a user that does not currently exist in the database. This is done by
 * checking the collection and ensuring that the error code is 400.
 */
test('PUT /users failure old user does not exist', async () => {
    const sessionId = createSession("Yano", 5);

    const newUser = generateUserData();

    const testResponse = await testRequest.put("/users/").send({
        userId: "FGD781274",
        username: newUser.username,
        password: newUser.password,
        status: newUser.status,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        biography: newUser.biography,
        image: newUser.image
    }).set("Cookie", "sessionId="+sessionId);

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(500);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
})

/**
 * Test checks that the correct error is thrown for a database error. This
 * is achieved by stopping the connection to the database before trying to 
 * update a user that has been added beforehand. The test then checks for\
 * a 500 level server side error.
 */
test('PUT /users failure database error', async () => {
    const sessionId = createSession("Yano", 5);

    const oldUser = generateUserData();
    const newUser = generateUserData();
    const addedUser = await model.addUser(oldUser.username, oldUser.password, oldUser.status, oldUser.firstName, oldUser.lastName, oldUser.biography, oldUser.image);
    await mongod.stop();

    const testResponse = await testRequest.put("/users/").send({
        userId: addedUser._id,
        username: newUser.username,
        password: newUser.password,
        status: newUser.status,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        biography: newUser.biography,
        image: newUser.image
    }).set("Cookie", "sessionId="+sessionId);

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await model.initialize("Test_Message_App", url, true);

    expect(testResponse.status).toBe(500);
})



//TESTING DELETE

/**
 * Test verifies that the delete operation is successful by adding a new user
 * to the database only to delete them. It then checks the returned status as
 * well as the collection to ensure the user was actually deleted. 
 */
test('DELETE /users success case', async () => {
    const sessionId = createSession("Yano", 5);

    const user = generateUserData();
    const addedUser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);

    const testResponse = await testRequest.delete("/users/").send({
        userId: addedUser._id
    }).set("Cookie", "sessionId="+sessionId);

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(200);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
})

/**
 * Test verifies that the delete operation fails gracefully when trying to delete
 * a user that does not currently exist in the database. Checks for a status code
 * of 400 and verifies the size of the collection is still 0.
 */
test('DELETE /users failure user does not exist', async () => {
    const sessionId = createSession("Yano", 5);

    const testResponse = await testRequest.delete("/users/").send({
        userId: "WF12085124",
    }).set("Cookie", "sessionId="+sessionId);

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(500);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
})

/**
 * Tests the delete operation when faced with a database error. This is done by severing
 * the connection the database and then trying to delete a user. The return status is 
 * checked for a 500 level status code.
 */
test('DELETE /users failure database error', async () => {
    const sessionId = createSession("Yano", 5);

    const user = generateUserData();
    const addedUser = await model.addUser(user.username, user.password, user.status, user.firstName, user.lastName, user.biography, user.image);
    await mongod.stop();
    
    const testResponse = await testRequest.delete("/users/").send({
        userId: addedUser._id,
    }).set("Cookie", "sessionId="+sessionId);

    mongod = await MongoMemoryServer.create();
    const url = await mongod.getUri();
    await model.initialize("Test_Message_App", url, true);

    expect(testResponse.status).toBe(500);
})

