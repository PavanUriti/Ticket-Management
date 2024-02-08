const portalRoute = require('../app/routes/route');

/**
 * All the routes will goes here
 * @param {app}  app
 * @return {void}
 */
module.exports = async function(app) {
    app.use(portalRoute.publicRouter);
};