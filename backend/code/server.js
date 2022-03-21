const express = require('express');
const morgan = require('morgan');
const logger = require('./logger')(module);
const app = express();
const port = 80;

const bodyParser = require('body-parser');
const { mockRouter, dataRouter, statRouter } = require('./routes');

const cors = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
};

const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded({ extended: true });

if (process.env.NODE_ENV == 'dev') {
    app.use([jsonParser, urlParser, cors]);
} else {
    app.use([jsonParser, urlParser]);
}

if (process.env.SERVER_LOGS.toLowerCase() === 'true') {
    app.use(morgan('common'));
}

app.use('/mock', mockRouter);
app.use('/data', dataRouter);
app.use('/stat', statRouter);

app.listen(port, () => logger.info(`server started on port ${port}!`));
