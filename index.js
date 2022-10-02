const gui = require('./src/gui');
const database = require('./src/database');

// application starts
database.start()                    // start database
    .then(async (database) => {     // then
        await gui();                    // wait for GUI to end
        database.close();               // close database
    });
