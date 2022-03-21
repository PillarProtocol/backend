const httpStatus = require('http-status');
const { unlockingRequest } = require('../../../models');

const controller = async (req, res, next) => {
    let address = res.locals.address.toLowerCase();
    let _unlockingRequest = await unlockingRequest.find({ user: address, status: 'Created' });

    _unlockingRequest = _unlockingRequest.map(({ requestId, block, shares }) => {
        return {
            requestId,
            block,
            shares,
        };
    });

    return res.status(httpStatus.OK).json(_unlockingRequest);
};

module.exports = controller;
