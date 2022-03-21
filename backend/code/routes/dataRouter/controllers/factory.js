const httpStatus = require('http-status');
const { vaults, prices, collectives } = require('../../../models');
const { getContractState, getNames, getContractSubState, collateralToAddressMap } = require('../../../zil_lib');
const { Binance } = require('../../../constants');

const BN = require('bignumber.js');

var totalVaultsUpdatedAt = 0;
var _tempTotalVaults;

var updateTime = 6000;

var vaultParamsUpdatedAt = 0;
var _tempMinColRatio;
var _tempInterestRate;

const controller = async (req, res, next) => {
    let type = res.locals.type;
    let totalsData = await getTotals(type);
    let state = await getStateFromContract(type);
    return res.status(httpStatus.OK).json({
        ...totalsData,
        ...state,
    });
};

module.exports = controller;

const getTotals = async (type) => {
    let _prices = await prices.find({ source: Binance });
    let _collectives = await collectives.find({});

    let totalPillar = _collectives
        .reduce((accumulator, item) => accumulator.plus(new BN(item.value.totalPillarMinted)), new BN(0))
        .toNumber();

    let totalPillarRepaid = _collectives
        .reduce((accumulator, item) => accumulator.plus(new BN(item.value.totalPillarRepaid)), new BN(0))
        .toNumber();

    let totalCollateral = _collectives
        .reduce((accumulator, item) => accumulator.plus(new BN(item.value.totalCollateral)), new BN(0))
        .toNumber();

    let { value: price } = _prices.filter((p) => p.collateral === type)[0];

    // console.log({ type, names: getNames() });

    let typeList = getNames();
    let collateralList = collateralToAddressMap();
    let decimals = collateralList[type].decimals;
    let vaultFactory = typeList[type].factory;
    let exp = new BN(10).exponentiatedBy(decimals);

    let collateralLockedInCents = new BN(totalCollateral).multipliedBy(price).multipliedBy(100).dividedBy(exp);

    let totalVaults;
    let now = parseInt(new Date().valueOf());
    if (now - totalVaultsUpdatedAt > updateTime) {
        let { total_vaults } = await getContractSubState(typeList[type].storage, 'total_vaults');
        _tempTotalVaults = total_vaults;
        totalVaultsUpdatedAt = now;
    }
    totalVaults = _tempTotalVaults;

    let vaultsOccupied = totalVaults;

    return {
        totalPillar,
        totalPillarRepaid,
        totalCollateral,
        totalVaults,
        vaultsOccupied,
        collateralLockedInCents: collateralLockedInCents.toNumber(),
        vaultFactory,
    };
};

const getStateFromContract = async (type) => {
    let typeList = getNames();
    // console.log({ type, typeList });
    let paramsContractAddress = typeList[type].param;
    // console.log({paramsContractAddress});

    let liquidationRatio;
    let interest_rate_per_10000_token;

    let now = parseInt(new Date().valueOf());
    if (now - vaultParamsUpdatedAt > updateTime) {
        let { minimum_collateralization_ratio, interest_rate_per_10000_token: ir } = await getContractState(paramsContractAddress);

        _tempMinColRatio = minimum_collateralization_ratio;
        _tempInterestRate = ir;
        vaultParamsUpdatedAt = now;
    }
    liquidationRatio = _tempMinColRatio;
    interest_rate_per_10000_token = _tempInterestRate;

    return {
        minimumCollateral: '0',
        liquidationRatio,
        interestRate: interest_rate_per_10000_token / 100,
    };
};

// {
//   "totalPillar": 8100000,
//   "totalPillarRepaid": 8100000,
//   "totalCollateral": 8100000,
//   "totalVaults": "2",
//   "vaultsOccupied": "2",
//   "collateralLockedInCents": 913262.85,
//   "minimumCollateral": "1000000000",
//   "liquidationRatio": "25000",
//   "interestRate": 1
// }
