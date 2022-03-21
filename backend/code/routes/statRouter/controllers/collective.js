const httpStatus = require('http-status');
const { collectives } = require('../../../models');

const controller = async (req, res, next) => {
    let _collective = await collectives.find({});
    _collective = _collective.map(({ collateral, value }) => {
        return {
            collateral,
            value,
        };
    });
    return res.status(httpStatus.OK).json(_collective);
};

module.exports = controller;
