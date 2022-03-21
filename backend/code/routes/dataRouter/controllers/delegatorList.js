const httpStatus = require('http-status');
const { delegations } = require('../../../models');

const controller = async (req, res, next) => {
    let _delegations = await delegations.find().sort({ stake: -1 }).limit(10).exec();

    _delegations = _delegations.map(({ user, stake }) => {
        return {
            user,
            stake,
        };
    });

    return res.status(httpStatus.OK).json(_delegations);
};

module.exports = controller;
