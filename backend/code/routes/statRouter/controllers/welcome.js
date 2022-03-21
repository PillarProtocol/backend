const httpStatus = require('http-status');

const welcome = async (req, res, next) => {
    return res.status(httpStatus.OK).json({
        message: 'Welcome! to stat service',
    });
};

module.exports = welcome;
