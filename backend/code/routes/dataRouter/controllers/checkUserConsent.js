const httpStatus = require('http-status');
const { userConsent } = require('../../../models');

const controller = async (req, res, next) => {
    let { address } = res.locals;
    let _userConsent = await userConsent.findOne({ address });
    if (_userConsent) {
        return res.status(httpStatus.OK).json({ status: true });
    } else {
        return res.status(httpStatus.OK).json({ status: false });
    }
};

module.exports = controller;
