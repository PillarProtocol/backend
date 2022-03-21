const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const getLabel = (callingModule) => {
    let parts = callingModule.filename.split('/');
    return parts[parts.length - 2] + '/' + parts.pop();
};
const logger = (callingModule) =>
    createLogger({
        format: combine(label({ label: `Pillar Backend: ${getLabel(callingModule)}` }), timestamp(), myFormat),
        transports: [new transports.Console()],
    });

module.exports = logger;
