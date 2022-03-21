const httpStatus = require('http-status');
const { vaults, params, prices } = require('../../../models');
const BN = require('bignumber.js');
const { getContractState, collateralToAddressMap, getNames } = require('../../../zil_lib');

const { latestBlock } = require('../../../constants');
const { Binance } = require('../../../constants');

var updateTime = 6000;

var vaultParamsUpdatedAt = 0;
var _tempMinColRatio;
var _tempInterestRate;
var _tempBpy;

const getLatestBlock = async () => {
    let { value } = await params.findOne({ param: latestBlock });
    return value;
};

const controller = async (req, res, next) => {
    const latestBlock = await getLatestBlock();
    let { page, pageLimit, vaultId: _vaultId, vaultFactory, type: col } = res.locals;
    let vaultAddress = res.locals.vaultAddress;
    let _vault = await vaults
        .findOne({ collateral: col, vaultId: _vaultId })
        .skip(page * pageLimit)
        .limit(pageLimit)
        .exec();
    let {
        vaultId,
        collateral: type,
        owner,
        collateralAmount: collateralLocked,
        pillarBorrowed: pillarBorrowed,
        interestAccumulated: interestRemaining,
        updatedAt,
    } = _vault;

    let _prices = await prices.find({ source: Binance });
    let { value: price } = _prices.filter((p) => p.collateral === type)[0];

    let allCollaterals = collateralToAddressMap();
    let { decimals } = allCollaterals[type];
    let actualPrice = new BN(collateralLocked).multipliedBy(price).multipliedBy(new BN(10).pow(-decimals + 2));

    let typeList = getNames();
    // console.log({ type, typeList });
    let paramsContractAddress = typeList[type].param;

    let now = parseInt(new Date().valueOf());

    if (now - vaultParamsUpdatedAt > updateTime) {
        let { minimum_collateralization_ratio, interest_rate_per_10000_token: ir, blocks_per_year: bpy } = await getContractState(
            paramsContractAddress
        );

        _tempMinColRatio = minimum_collateralization_ratio;
        _tempInterestRate = ir;
        _tempBpy = bpy;

        vaultParamsUpdatedAt = now;
    }

    liquidationRatio = _tempMinColRatio;
    interestPer10000PillarToken = _tempInterestRate;
    blocksPerYear = _tempBpy;

    let diff = new BN(latestBlock).minus(updatedAt);
    let diffInterest = diff.multipliedBy(pillarBorrowed).multipliedBy(interestPer10000PillarToken).div(blocksPerYear).div(10000);
    let interestAccumulated = diffInterest.plus(interestRemaining);

    return res.status(httpStatus.OK).json({
        vaultAddress,
        vaultId,
        type,
        collateralLocked,
        collateralLockedInCents: actualPrice.toNumber(),
        owner,
        pillarBorrowed,
        totalDebt: new BN(pillarBorrowed).plus(interestAccumulated).toNumber(),
        interestAccumulated: interestAccumulated.toNumber(),
        interestRate: interestPer10000PillarToken / 100,
        minimumCollateral: 0,
        liquidationRatio,
        updatedAt: updatedAt > 1 ? updatedAt : null,
        latestBlock,
    });
};

module.exports = controller;

// vaultAddress: "0x" + keccak256(uuidv4()).toString("hex").slice(0, 40),
//     vaultId,
//     type,
//     owner: "0x" + keccak256(uuidv4()).toString("hex").slice(0, 40),
//     collateralLocked: randomAmount,
//     pillarBorrowed: randomAmount2,
//     interestRate: randDecimal(),
//     minimumCollateral: parseInt(100 * randDecimal()),
//     liquidationRatio: parseInt(10 * randDecimal()),
//     totalDebt: parseInt(1000 * randDecimal()),
//     interestAccumulated: parseInt(1000 * randDecimal()),

// {
//     "owner": "0x05Ad355c16FAda949Be5CDC06D56eb5ceD3c89a3",
//     "collateralAmount": 5000000000000,
//     "principleRemaining": 19036,
//     "interestRemaining": 23,
//     "pillarAvailableForBurning": 0,
//     "updatedAt": 2543128,
//     "createdAt": 1615989834271597,
//     "_id": "605394ec08ea4100373d4830",
//     "vaultId": "1",
//     "vaultAddress": "0xBb803BD965d86e0Db31362653750e2951C1FCeFf",
//     "collateral": "WZIL",
//     "__v": 0
//   }
