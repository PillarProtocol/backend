const httpStatus = require('http-status');
const { prices } = require('../../../models');

const middleware = async (req, res, next) => {
    let type = req.params.type.trim();
    let _price = await prices.findOne({ collateral: type });
    if (_price) {
        res.locals.symbol = _price.symbol;
        next();
    } else {
        return res.status(httpStatus.BAD_REQUEST).json({ message: `Cannot find price related to ${type}` });
    }
};

module.exports = middleware;
