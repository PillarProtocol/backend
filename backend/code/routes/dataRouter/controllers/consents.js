const httpStatus = require('http-status');
const { userConsent } = require('../../../models');

const controller = async (req, res, next) => {
    let { page, pageLimit } = res.locals;
    let _userConsent = await userConsent
        .find()
        .skip(page * pageLimit)
        .limit(pageLimit)
        .exec();

    _userConsent = _userConsent.map(({ publicKey, message, signature, address }) => {
        return {
            publicKey,
            message,
            signature,
            address,
        };
    });

    return res.status(httpStatus.OK).json(_userConsent);
};

module.exports = controller;
