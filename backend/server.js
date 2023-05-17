require("dotenv").config();
const app = require('./app.js');
const port1 = 1339;
const port2 = 1338;
const port3 = 1337;
const chatModel = require("./models/chatModel");
const messageModel = require("./models/messageModel");
const userModel = require("./models/userModel");
const url = process.env.URL_PRE + process.env.MONGODB_PWD + process.env.URL_POST;
initializeModels();
/**
 * Initializes models
 */
async function initializeModels() {
    await messageModel.initialize("Message_App", url, false);
    await userModel.initialize("Message_App", url, false);
    await chatModel.initialize(url, "Message_App", false);
    await app.listen(port3); // Run the server
    await chatModel.addChat('645af9717cc81875398495a7','645af97e7cc81875398495a8')
}