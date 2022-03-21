const httpStatus = require('http-status');
const { unlockingRequest } = require('../../../models');

const controller = async (req, res, next) => {
    let _unlockingRequest = await unlockingRequest.find({});

    _unlockingRequest = _unlockingRequest.map(({ user, requestId, block, shares, status }) => {
        return {
            user,
            requestId,
            block,
            shares,
            status,
        };
    });

    return res.status(httpStatus.OK).json(_unlockingRequest);
};

module.exports = controller;
