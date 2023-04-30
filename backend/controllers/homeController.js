const express = require('express');
const router = express.Router();
const routeRoot = '/';


/**
 * Hello web page.
 * @param {*} request HTTP request.
 * @param {*} response HTTP response.
 */
router.get("/", sayHello); 
function sayHello(request, response) {

    const output = "Hello there!";
    response.cookie('seb', 'Sebastian', {maxAge: 60000, httpOnly: true});
    response.cookie('seb', 'Sebastian', {expires: new Date(Date.now() + 120000)});
    const cookies = request.cookies;
    const name = request.cookies.name;
    const username = request.cookies['username']; 
    console.log(name);
    console.log(username);
    response.send(output);
}

module.exports = {
    router,
    routeRoot
}
