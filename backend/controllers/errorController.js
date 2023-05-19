const express = require('express');
const router = express.Router();
const routeRoot = '*';

/**
 * Error page. Sets response status to 404 and sets the body to an appropriate error message.
 * @param {*} request Request that hit an invalid endpoint
 * @param {*} response Response will contain a 404 and an error message
 */
router.get('*', showErrorPage);
async function showErrorPage(request, response){
    response.status(404);
    response.send('Invalid URL entered. Please try again.')
}

module.exports = {
    router,
    routeRoot,
    showErrorPage
}