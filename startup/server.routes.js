const userRouter = require('../app/routes/user.route');
const busRouter = require('../app/routes/bus.route');

/**
 * All the routes will goes here
 * @param {app}  app
 * @return {void}
 */
module.exports = async function(app) {
    app.use('/api/v1/users', userRouter);
    app.use('/api/v1/buses', busRouter);
};