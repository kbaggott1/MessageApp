const express = require('express');
const router = express.Router();
const routeRoot = '*';
const { refreshSession } = require('./sessionController');

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