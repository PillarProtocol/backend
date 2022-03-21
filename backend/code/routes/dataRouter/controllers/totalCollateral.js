const httpStatus = require('http-status');
const { collectives, transactions, prices } = require('../../../models');
const BN = require('bignumber.js');
const {
    events: {
        VaultFactoryEvents: { AddCollateral, ReleaseCollateral },
    },
    Binance,
} = require('../../../constants');

const { collateralToAddressMap } = require('../../../zil_lib');

const moment = require('moment');

var monthNames = [];
const diffNumber = 1;

let cache = {};
let cacheLastUpdatedAt = new Date(0);
let FIVE_MIN = 5 * 60 * 1000;

const controller = async (req, res, next) => {
    if (new Date() - cacheLastUpdatedAt > FIVE_MIN || true) {
        let now = moment();
        monthNames = [];
        for (let index = 0; index < 12; index++) {
            monthNames.push(now.format('Do MMM'));
            now.subtract(diffNumber, 'days');
        }

        monthNames = monthNames.reverse();

        let value = await getTotal();
        let diff = await getDiff(7);
        let historicData = await getHistoricData(value);

        cache = {
            value,
            diff,
            diffPercent: getDiffPercent(diff, value),
            historicData,
        };
        cacheLastUpdatedAt = new Date();
    }
    return res.status(httpStatus.OK).json(cache);
};

const getTotal = async () => {
    let _collectives = await collectives.find({});
    // console.log(_collectives);
    if (_collectives.length == 0) {
        return 0;
    }
    let allCollaterals = collateralToAddressMap();

    let _prices = await prices.find({ source: Binance });

    let value = _collectives
        .reduce((accumulator, item) => {
            // console.log(item);
            let decimals = allCollaterals[item.collateral].decimals;
            let { value: price } = _prices.filter((p) => p.collateral === item.collateral)[0];

            let actualPrice = new BN(item.value.totalCollateral).multipliedBy(price).multipliedBy(new BN(10).pow(-decimals + 2));

            return accumulator.plus(actualPrice);
        }, new BN(0))
        .toNumber();
    return value;
};

const getDiff = async (days) => {
    let oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - days).valueOf();
    let oneWeekAgoTimestamp = new BN(oneWeekAgo.valueOf()).multipliedBy('1000').toNumber();
    let _transactions = await transactions
        .find({
            timestamp: { $gte: oneWeekAgoTimestamp },
        })
        .sort({ timestamp: -1 })
        .populate('vault');

    let allCollaterals = collateralToAddressMap();
    let _prices = await prices.find({ source: Binance });

    let diff = _transactions
        .reduce((accumulator, { operation, amount, vault: { collateral } }) => {
            let { decimals } = allCollaterals[collateral];
            let { value: price } = _prices.filter((p) => p.collateral === collateral)[0];

            let actualAmount = new BN(amount).multipliedBy(price).multipliedBy(new BN(10).pow(-decimals + 2));

            if (operation == AddCollateral) {
                return accumulator.plus(actualAmount);
            } else if (operation == ReleaseCollateral) {
                return accumulator.minus(actualAmount);
            } else {
                return accumulator;
            }
        }, new BN(0))
        .toNumber();
    return diff;
};

const getDiffPercent = (diff, value) => {
    if (value == 0) {
        return 0;
    }
    return new BN(100).multipliedBy(new BN(diff)).div(new BN(value)).toNumber();
};

const getHistoricData = async (currentTotal) => {
    var d = new Date();
    let months = [];
    let value = [];

    let currentMonthNumber = 11;
    let currentMonthName = monthNames[currentMonthNumber];
    let currentMonthValue = currentTotal;
    months.push(currentMonthName);
    value.push(currentMonthValue);

    let oneMonthBackNumber = getLastMonth(currentMonthNumber);
    let oneMonthBackName = monthNames[oneMonthBackNumber];
    let oneMonthBackValue = await getDiff(diffNumber * 1);
    oneMonthBackValue = new BN(currentTotal).minus(new BN(oneMonthBackValue)).toNumber();

    months.push(oneMonthBackName);
    value.push(oneMonthBackValue);

    let twoMonthBackNumber = getLastMonth(oneMonthBackNumber);
    let twoMonthBackName = monthNames[twoMonthBackNumber];
    let twoMonthBackValue = await getDiff(diffNumber * 2);
    twoMonthBackValue = new BN(currentTotal).minus(new BN(twoMonthBackValue)).toNumber();
    months.push(twoMonthBackName);
    value.push(twoMonthBackValue);

    let threeMonthBackNumber = getLastMonth(twoMonthBackNumber);
    let threeMonthBackName = monthNames[threeMonthBackNumber];
    let threeMonthBackValue = await getDiff(diffNumber * 3);
    threeMonthBackValue = new BN(currentTotal).minus(new BN(threeMonthBackValue)).toNumber();
    months.push(threeMonthBackName);
    value.push(threeMonthBackValue);

    let fourMonthBackNumber = getLastMonth(threeMonthBackNumber);
    let fourMonthBackName = monthNames[fourMonthBackNumber];
    let fourMonthBackValue = await getDiff(diffNumber * 4);
    fourMonthBackValue = new BN(currentTotal).minus(new BN(fourMonthBackValue)).toNumber();
    months.push(fourMonthBackName);
    value.push(fourMonthBackValue);

    let fiveMonthBackNumber = getLastMonth(fourMonthBackNumber);
    let fiveMonthBackName = monthNames[fiveMonthBackNumber];
    let fiveMonthBackValue = await getDiff(diffNumber * 5);
    fiveMonthBackValue = new BN(currentTotal).minus(new BN(fiveMonthBackValue)).toNumber();
    months.push(fiveMonthBackName);
    value.push(fiveMonthBackValue);

    return {
        months: months.reverse(),
        value: value.reverse(),
    };
};

const getLastMonth = (n) => {
    if (n == 0) {
        return 11;
    } else {
        return n - 1;
    }
};
module.exports = controller;

// {
//     value: 100 * randDecimal(),
//     diff: randDecimal(),
//     diffPercent: randDecimal(),
//     historicData: {
//       months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//       value: [
//         100 * randDecimal(),
//         100 * randDecimal(),
//         100 * randDecimal(),
//         100 * randDecimal(),
//         100 * randDecimal(),
//         100 * randDecimal(),
//       ],
//     },
//   }

// {
//     "owner": "0x05Ad355c16FAda949Be5CDC06D56eb5ceD3c89a3",
//     "collateralAmount": 5000000000000,
//     "principleRemaining": 0,
//     "interestRemaining": 0,
//     "pillarAvailableForBurning": 0,
//     "updatedAt": 2542703,
//     "createdAt": 1615989834271597,
//     "_id": "605394ec08ea4100373d4830",
//     "vaultId": "1",
//     "vaultAddress": "0xBb803BD965d86e0Db31362653750e2951C1FCeFf",
//     "collateral": "WZIL",
//     "__v": 0
//   }
