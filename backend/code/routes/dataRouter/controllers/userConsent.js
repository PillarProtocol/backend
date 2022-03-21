const httpStatus = require('http-status');
const { userConsent } = require('../../../models');

const controller = async (req, res, next) => {
    let { address, message, signature, publicKey } = res.locals;
    let _userConsent = await userConsent.findOne({ address });
    if (_userConsent) {
        await userConsent.updateOne({ address, message, signature, publicKey });
    } else {
        await new userConsent({ message, signature, publicKey, address }).save();
    }

    return res.status(httpStatus.OK).json({ status: true });
};

module.exports = controller;
