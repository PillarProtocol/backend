require('./checkEnv');
mongoose = require('mongoose');
const { worker1, worker2, worker3 } = require('./listeners');
const init = require('./init');
const logger = require('./logger')(module);

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
};

try {
    let user = process.env.MONGO_USER || 'admin';
    let password = process.env.MONGO_PASSWORD || 'password';
    let mongo_url = process.env.MONGO_URL || 'mongo:27017';
    let dbName = process.env.MONGO_DB_NAME || 'admin';
    let connectionString;
    if (process.env.NODE_ENV == 'prod') {
        connectionString = process.env.MONGO_CONNECTION;
    } else {
        connectionString = `mongodb://${user}:${password}@${mongo_url}/${dbName}`;
    }
    mongoose
        .connect(connectionString, options)
        .then(function () {
            logger.info('Mongoose connected');
            return init();
        })
        .then(function (data) {
            logger.info(data);
            worker1();
            return;
        })
        .then(function () {
            worker2();
            return;
        })
        .then(function () {
            worker3();
            return;
        })
        .then(function () {
            if (process.env.ENABLE_SERVER.toLowerCase() === 'true') {
                require('./server');
            } else {
                logger.info('Server is not enabled');
            }
        });
} catch (ex) {
    console.log(ex);
    process.exit(1);
}
