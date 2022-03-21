const httpStatus = require('http-status');

const welcome = async (req, res, next) => {
    let cols = process.env.COLLATERAL_NAMES.split(',');
    cols = cols.map((col) => col.trim());
    return res.status(httpStatus.OK).json(cols);
};

module.exports = welcome;
