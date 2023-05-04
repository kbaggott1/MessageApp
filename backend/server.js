require("dotenv").config();
const app = require('./app.js');
const port = 1339;
const chatModel = require("./models/chatModel");
const messageModel = require("./models/messageModel");
const userModel = require("./models/userModel");
const url = process.env.URL_PRE + process.env.MONGODB_PWD + process.env.URL_POST;


/**
 * Initializes models
 */
chatModel.initialize(url, "Message_App", false)
.then(
    app.listen(port) // Run the server
);

messageModel.initialize(url, "Message_App", false)
.then(
    app.listen(port) // Run the server
);

userModel.initialize(url, "Message_App", false)
.then(
    app.listen(port) // Run the server
);