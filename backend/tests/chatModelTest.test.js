require('dotenv').config();
jest.setTimeout(10000);
const { MongoMemoryServer } = require('mongodb-memory-server');
const model = require("../models/userModel.js");
const { initialize } = require('../models/userModel.js');
const utils = require("../helperMethods/validateUtilsChatModel.js");