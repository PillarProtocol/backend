const httpStatus = require('http-status');
const { transactions } = require('../../../models');
const {
    events: {
        VaultFactoryEvents: { MintPillar, Repay, AddCollateral, ReleaseCollateral },
    },
} = require('../../../constants');

const controller = async (req, res, next) => {
    let { page, pageLimit } = res.locals;
    let _transactions = await transactions
        .find()
        .sort({ timestamp: -1 })
        .populate('vault')
        .skip(page * pageLimit)
        .limit(pageLimit)
        .exec();

    _transactions = _transactions.map(({ timestamp, transactionHash, amount, operation, details, vault: { collateral, vaultId } }) => {
        return {
            timestamp,
            transactionHash,
            vaultId,
            amount,
            collateral,
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
        } else {
            return tx;
        }
    });
    return res.status(httpStatus.OK).json(_transactions);
};

module.exports = controller;

// {
//     timestamp: parseInt(parseInt(timestamp) + parseInt(adder)),
//     transactionHash: "0x" + keccak256(uuidv4()).toString("hex"),
//     vaultId: parseInt(adder),
//     amount: randomAmount,
//     collateral: allCollaterals.includes(type.trim())
//       ? type
//       : allCollaterals[Math.floor(Math.random() * allCollaterals.length)],
//     operation: operations[Math.floor(Math.random() * operations.length)],
//   }
