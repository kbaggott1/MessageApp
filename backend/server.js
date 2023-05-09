require("dotenv").config();
const app = require('./app.js');
const port1 = 1339;
const port2 = 1338;
const port3 = 1337;
const chatModel = require("./models/chatModel");
const messageModel = require("./models/messageModel");
const userModel = require("./models/userModel");
const url = process.env.URL_PRE + process.env.MONGODB_PWD + process.env.URL_POST;

/**
 * Initializes models
 */
chatModel.initialize(url, "Message_App", false)
.then(
    app.listen(port1) // Run the server
);

messageModel.initialize(url, "Message_App", false)
.then(
    app.listen(port2) // Run the server
);

userModel.initialize("Message_App", url, false)
.then(
    app.listen(port3) // Run the server
);
