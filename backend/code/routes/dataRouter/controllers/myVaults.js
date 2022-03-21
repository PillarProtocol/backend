const httpStatus = require('http-status');
const { vaults } = require('../../../models');

const controller = async (req, res, next) => {
    let _vaults = await vaults.find({ owner: res.locals.address });
    _vaults = _vaults.map(({ collateral, vaultId }) => {
        return {
            type: collateral,
            id: vaultId,
        };
    });
    return res.status(httpStatus.OK).json(_vaults);
};

module.exports = controller;

// type: allCollaterals[Math.floor(Math.random() * allCollaterals.length)],
// address: "zil1ys392lrfnjcxlm7t8qxhvtyxlpqqy38kz8pt0h",
// id: parseInt(1000 * randDecimal()),
