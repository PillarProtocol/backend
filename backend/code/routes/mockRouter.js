const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const allCollaterals = ['WZIL', 'gZIL', 'WBTC'];
const operations = ['Borrow', 'Repay'];

const { v4: uuidv4 } = require('uuid');
const keccak256 = require('keccak256');

router.get('/', async (req, res, next) => {
    return res.status(httpStatus.OK).json({
        message: 'Welcome! to mock service',
    });
});

router.get('/collaterals', async (req, res, next) => {
    return res.status(httpStatus.OK).json(['WZIL', 'gZIL', 'WBTC']);
});

router.get('/myVaults/:address', async (req, res, next) => {
    return res.status(httpStatus.OK).json(generateMyVaults(10));
});

router.get('/totalPillar', async (req, res, next) => {
    return res.status(httpStatus.OK).json({
        value: 100 * randDecimal(),
        diff: randDecimal(),
        diffPercent: randDecimal(),
        historicData: {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            value: [
                100 * randDecimal(),
                100 * randDecimal(),
                100 * randDecimal(),
                100 * randDecimal(),
                100 * randDecimal(),
                100 * randDecimal(),
            ],
        },
    });
});

router.get('/totalCollateral', async (req, res, next) => {
    return res.status(httpStatus.OK).json({
        value: 100 * randDecimal(),
        diff: -randDecimal(),
        diffPercent: -randDecimal(),
        historicData: {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            value: [
                100 * randDecimal(),
                100 * randDecimal(),
                100 * randDecimal(),
                100 * randDecimal(),
                100 * randDecimal(),
                100 * randDecimal(),
            ],
        },
    });
});

router.get('/transactions/:type', async (req, res, next) => {
    let type = req.params.type.trim();
    return res.status(httpStatus.OK).json(generateTransactions(type, 10));
});

router.get('/factory/:vaultFactory', async (req, res, next) => {
    let vaultFactory = req.params.vaultFactory.trim();
    if (allCollaterals.includes(vaultFactory)) {
        return res.status(httpStatus.OK).json({
            totalCollateral: parseInt(1000 * randDecimal()),
            totalPillar: parseInt(1000 * randDecimal()),
            interestRate: randDecimal(),
            minimumCollateral: parseInt(10 * randDecimal()),
            liquidationRatio: parseInt(10 * randDecimal()),
            totalVaults: parseInt(100 * randDecimal()),
            vaultsOccupied: parseInt(50 * randDecimal()),
        });
    } else {
        return res.status(httpStatus.NOT_FOUND).json({
            message: 'Cannot find such collateral',
        });
    }
});

router.get('/allVaults/:vaultFactory', async (req, res, next) => {
    let vaultFactory = req.params.vaultFactory.trim();
    if (allCollaterals.includes(vaultFactory)) {
        return res.status(httpStatus.OK).json(generateVaults(vaultFactory, 10));
    } else {
        return res.status(httpStatus.NOT_FOUND).json({
            message: 'Cannot find such collateal',
        });
    }
});

router.get('/vaultTransactions/:vaultFactory/:vaultId', async (req, res, next) => {
    let vaultFactory = req.params.vaultFactory.trim();
    let vaultId = req.params.vaultId.trim();
    if (allCollaterals.includes(vaultFactory)) {
        return res.status(httpStatus.OK).json(generateVaultsTransactions(vaultFactory, vaultId, 10));
    } else {
        return res.status(httpStatus.NOT_FOUND).json({
            message: 'Cannot find such collateal',
        });
    }
});

router.get('/vault/:vaultFactory/:vaultId', async (req, res, next) => {
    let vaultFactory = req.params.vaultFactory.trim();
    let vaultId = req.params.vaultId.trim();
    if (allCollaterals.includes(vaultFactory)) {
        return res.status(httpStatus.OK).json(generateVaultData(vaultFactory, vaultId));
    } else {
        return res.status(httpStatus.NOT_FOUND).json({
            message: 'Cannot find such collateal',
        });
    }
});

router.get('/approvedCollateral/:vaultFactory/:address', async (req, res, next) => {
    let address = req.params.address;
    let vaultFactory = req.params.vaultFactory;

    if (allCollaterals.includes(vaultFactory)) {
        return res.status(httpStatus.OK).json({ value: parseInt(randDecimal() * 1000) });
    } else {
        return res.status(httpStatus.NOT_FOUND).json({
            message: 'Cannot find such collateal',
        });
    }
});

module.exports = router;

function randDecimal() {
    let precision = 100;
    let randomnum = Math.floor(Math.random() * (10 * precision - 1 * precision) + 1 * precision) / (1 * precision);
    return randomnum;
}

function generateTransactions(type, n) {
    let transactions = [];
    let timestamp = parseInt(new Date().valueOf());
    let gap = 10000000;
    let amount = 11238;

    for (let index = 0; index < n; index++) {
        let adder = Math.floor(Math.random() * gap) + 1;
        let randomAmount = Math.floor(Math.random() * amount) + 1;
        transactions.push({
            timestamp: parseInt(parseInt(timestamp) + parseInt(adder)),
            transactionHash: '0x' + keccak256(uuidv4()).toString('hex'),
            vaultId: parseInt(adder),
            amount: randomAmount,
            collateral: allCollaterals.includes(type.trim()) ? type : allCollaterals[Math.floor(Math.random() * allCollaterals.length)],
            operation: operations[Math.floor(Math.random() * operations.length)],
        });
        timestamp = parseInt(parseInt(timestamp) + parseInt(adder));
    }
    return transactions;
}

function generateVaults(type, n) {
    let vaults = [];
    let timestamp = parseInt(new Date().valueOf());
    let gap = 10000000;
    let amount = 3248345;
    for (let index = 0; index < n; index++) {
        let adder = Math.floor(Math.random() * gap) + 1;
        let randomAmount = Math.floor(Math.random() * amount) + 1;
        let randomAmount2 = Math.floor(Math.random() * amount) + 1;
        vaults.push({
            createdAt: parseInt(parseInt(timestamp) + parseInt(adder)),
            vaultId: parseInt(adder),
            type,
            collateralLocked: randomAmount,
            pillarBorrowed: randomAmount2,
            owner: '0x' + keccak256(uuidv4()).toString('hex').slice(0, 40),
        });
        timestamp = parseInt(parseInt(timestamp) + parseInt(adder));
    }
    return vaults;
}

function generateVaultsTransactions(type, vaultId, n) {
    let transactions = [];
    let timestamp = parseInt(new Date().valueOf());
    let gap = 10000000;
    let amount = 11238;

    for (let index = 0; index < n; index++) {
        let adder = Math.floor(Math.random() * gap) + 1;
        let randomAmount = Math.floor(Math.random() * amount) + 1;
        transactions.push({
            type,
            vaultId,
            timestamp: parseInt(parseInt(timestamp) + parseInt(adder)),
            transactionHash: '0x' + keccak256(uuidv4()).toString('hex'),
            amount: randomAmount,
            operation: operations[Math.floor(Math.random() * operations.length)],
        });
        timestamp = parseInt(parseInt(timestamp) + parseInt(adder));
    }
    return transactions;
}

function generateVaultData(type, vaultId) {
    let amount = 3248345;
    let randomAmount = Math.floor(Math.random() * amount) + 1;
    let randomAmount2 = Math.floor(Math.random() * amount) + 1;
    return {
        vaultId,
        type,
        owner: '0x' + keccak256(uuidv4()).toString('hex').slice(0, 40),
        collateralLocked: randomAmount,
        pillarBorrowed: randomAmount2,
        interestRate: randDecimal(),
        minimumCollateral: parseInt(100 * randDecimal()),
        liquidationRatio: parseInt(10 * randDecimal()),
        totalDebt: parseInt(1000 * randDecimal()),
        interestAccumulated: parseInt(1000 * randDecimal()),
    };
}

function generateMyVaults(n) {
    let vaults = [];
    for (let index = 0; index < n; index++) {
        vaults.push({
            type: allCollaterals[Math.floor(Math.random() * allCollaterals.length)],
            address: 'zil1ys392lrfnjcxlm7t8qxhvtyxlpqqy38kz8pt0h',
            id: parseInt(1000 * randDecimal()),
        });
    }
    return vaults;
}
