const httpStatus = require('http-status');
const { prices } = require('../../../models');

const controller = async (req, res, next) => {
    let { symbol } = res.locals;
    let { value, collateral, updatedAt } = await prices.findOne({ symbol });
    return res.status(httpStatus.OK).json({ symbol, value: parseFloat(value), collateral, updatedAt });
};

module.exports = controller;
