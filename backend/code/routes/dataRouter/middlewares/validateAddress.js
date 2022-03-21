const httpStatus = require('http-status');
const { getHexAddress } = require('../../../zil_lib');
const logger = require('../../../logger')(module);

const validateAddress = async (req, res, next) => {
    let address = req.params.address;
    if (!address) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Missing address' });
    }
    try {
        let decodedAddress = getHexAddress(address);
        res.locals.address = decodedAddress.trim();
        next();
    } catch (error) {
        logger.error(error);
        return res.status(httpStatus.BAD_REQUEST).json({ message: `${address} is not valid address` });
    }
};

module.exports = validateAddress;
