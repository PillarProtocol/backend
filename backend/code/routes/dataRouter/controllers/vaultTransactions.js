const httpStatus = require('http-status');
const { transactions } = require('../../../models');
const {
    events: {
        VaultFactoryEvents: { MintPillar, Repay, AddCollateral, ReleaseCollateral, Liquidate },
    },
} = require('../../../constants');

const controller = async (req, res, next) => {
    let { type, vaultFactory, page, pageLimit, vaultId } = res.locals;

    let _transactions = await transactions
        .find({ collateral: type, vaultId })
        .sort({ timestamp: -1 })
        .skip(page * pageLimit)
        .limit(pageLimit)
        .populate('vault')
        .exec();

    _transactions = _transactions.map(({ amount, operation, transactionHash, timestamp, details, vault: { collateral, vaultId } }) => {
        // console.log({collateral, vaultId});
        return {
            type: collateral,
            vaultId,
            transactionHash,
            timestamp,
            amount,
            operation,
            details,
        };
    });
    _transactions = _transactions.map((tx) => {
        if (tx.operation === MintPillar) {
            return { ...tx, operation: 'Borrow' };
        } else if (tx.operation === Repay) {
            return { ...tx, operation: 'Repay' };
        } else if (tx.operation === AddCollateral) {
            return { ...tx, operation: 'Add Collateral' };
        } else if (tx.operation === ReleaseCollateral) {
            return { ...tx, operation: 'Remove Collateral' };
        } else if (tx.operation === Liquidate) {
            return { ...tx, operation: 'Liquidate' };
        } else {
            return tx;
        }
    });
    return res.status(httpStatus.OK).json(_transactions);
};

module.exports = controller;

// {
//     type,
//     vaultId,
//     timestamp: parseInt(parseInt(timestamp) + parseInt(adder)),
//     transactionHash: "0x" + keccak256(uuidv4()).toString("hex"),
//     amount: randomAmount,
//     operation: operations[Math.floor(Math.random() * operations.length)],
//   }
