const httpStatus = require('http-status');
const { vaults } = require('../../../models');
const { getNames } = require('../../../zil_lib');

const nameList = getNames();

const validateVaultId = async (req, res, next) => {
    let vaultId = req.params.vaultId.trim();
    let collateral = res.locals.type;
    if (collateral === 'ALL') {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'Must specify the type of vault',
        });
    }
    let _vault = await vaults.findOne({ vaultId, collateral });
    if (_vault) {
        res.locals.vaultId = vaultId;
        res.locals.vaultFactory = nameList[_vault.collateral].factory;
        next();
    } else {
        return res.status(httpStatus.NOT_FOUND).json({
            message: `Cannot find ${res.locals.type} type vault ${vaultId}`,
        });
    }
};

module.exports = validateVaultId;
