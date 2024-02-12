const express = require('express');
const path = require('path');

const userRouter = require('../app/routes/user.route');
const busRouter = require('../app/routes/bus.route');

/**
 * All the routes will go here
 * @param {app} app
 * @return {void}
 */
module.exports = async function (app) {
  // Serve static files from the "public" directory
  app.use(express.static(path.join(__dirname, '../public')));

  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/buses', busRouter);

  // Add this middleware to ignore favicon requests
  app.use('/favicon.ico', (req, res) => res.status(204));

  // Route for the root ("/") to serve the index.html file
  app.get('/', (req, res, next) => {
    console.log(req.url);
    return res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });
};
