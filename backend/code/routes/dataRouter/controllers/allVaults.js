const httpStatus = require('http-status');
const BN = require('bignumber.js');

const { vaults, prices } = require('../../../models');
const { Binance } = require('../../../constants');
const { collateralToAddressMap } = require('../../../zil_lib');

const controller = async (req, res, next) => {
    let { type, page, pageLimit } = res.locals;
    let _vaults = await vaults
        .find(
            type === 'ALL'
                ? {}
                : {
                      collateral: type,
                  }
        )
        .sort({ createdAt: -1 })
        .skip(page * pageLimit)
        .limit(pageLimit)
        .exec();
    let _prices = await prices.find({ source: Binance });
    let allCollaterals = collateralToAddressMap();

    _vaults = _vaults.map(({ createdAt, vaultId, collateral, collateralAmount, owner, pillarBorrowed, updatedAt, interestAccumulated }) => {
        let { decimals } = allCollaterals[collateral];
        let { value: price } = _prices.filter((p) => p.collateral === collateral)[0];

        let actualAmount = new BN(collateralAmount).multipliedBy(price).multipliedBy(new BN(10).pow(-decimals + 2));

        return {
            createdAt,
            vaultId,
            type: collateral,
            collateralLocked: collateralAmount,
            pillarBorrowed,
            interestRemaining: interestAccumulated,
            collateralLockedInCents: actualAmount.toNumber(),
            updatedAt,
            owner,
        };
    });
    return res.status(httpStatus.OK).json(_vaults);
};

module.exports = controller;

// createdAt: parseInt(parseInt(timestamp) + parseInt(adder)),
// vaultId: parseInt(adder),
// type,
// collateralLocked: randomAmount,
// pillarBorrowed: randomAmount2,
// owner: "0x" + keccak256(uuidv4()).toString("hex").slice(0, 40),
