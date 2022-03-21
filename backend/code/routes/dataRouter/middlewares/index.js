const validateAddress = require('./validateAddress');
const validateCollateralType = require('./validateCollateralType');
const validateVaultId = require('./validateVaultId');
const validatePaginationData = require('./validatePaginationData');
const validatePriceRequest = require('./validatePriceRequest');
const verifyUserConsent = require('./verifyUserConsent');

module.exports = {
    validateAddress,
    validateCollateralType,
    validateVaultId,
    validatePaginationData,
    validatePriceRequest,
    verifyUserConsent,
};
