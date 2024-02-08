const express = require('express');

const app = express();

const PORT = 4000;
startup().then( ()=> {
    app.listen(PORT, () => {
        console.log(`Server is running on Port: ${PORT}`);
      });
}, (error)=>{
    console.info(`Error Starting the Server on port ${PORT}-${error}`);
});

/**
* app startup logic 
*/
async function startup() {
    await require('./startup/init')(app);
    await require('./startup/portal.routes')(app);
    app.use(require('./middleware/errorhandler')); // Error handling middleware
}

