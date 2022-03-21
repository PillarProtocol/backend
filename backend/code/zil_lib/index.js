const { Zilliqa } = require('@zilliqa-js/zilliqa');
const zilliqa = new Zilliqa(process.env.BLOCKCHAIN_URL);
const { print } = require('../helpers');

const { fromBech32Address, toBech32Address, schnorr, getAddressFromPublicKey } = require('@zilliqa-js/crypto');
const { sha256 } = require('js-sha256');
const checkpoints = require('../checkpoints');

const logger = require('../logger')(module);

const getLatestBlockData = async () => {
    const blockChainInfo = await zilliqa.blockchain.getBlockChainInfo();
    return blockChainInfo.result;
};

const getTransactions = async (blockNumber) => {
    const txns = await zilliqa.blockchain.getTxnBodiesForTxBlock('' + blockNumber);
    return txns;
};

const getTransactionBlock = async (blockNumber) => {
    const txBlock = await zilliqa.blockchain.getTxBlock('' + blockNumber);
    return txBlock;
};

const getHexAddress = (address) => {
    try {
        return fromBech32Address(address);
    } catch (e) {
        return fromBech32Address(toBech32Address(address));
    }
};

const collaterals = () => {
    let col = {};
    let addresses = process.env.COLLATERAL_ADDRESSES.split(',');
    let names = process.env.COLLATERAL_NAMES.split(',');
    let factory = process.env.VAULT_FACTORIES.split(',');
    let binancePriceSymbols = process.env.BINANCE_PRICE_SYMBOL.split(',');
    let decimals = process.env.COLLATERAL_DECIMALS.split(',');
    let params = process.env.VAULT_PARAMS.split(',');

    for (let index = 0; index < addresses.length; index++) {
        const element = getHexAddress(addresses[index]);
        col[element] = {
            name: names[index],
            factory: getHexAddress(factory[index]),
            binanceUrl: `${process.env.BINANCE_URL}${binancePriceSymbols[index]}`,
            symbol: binancePriceSymbols[index],
            decimals: decimals[index],
            param: params[index],
        };
    }
    return col;
};

const collateralToAddressMap = () => {
    let col = {};
    let addresses = process.env.COLLATERAL_ADDRESSES.split(',');
    let names = process.env.COLLATERAL_NAMES.split(',');
    let factory = process.env.VAULT_FACTORIES.split(',');
    let binancePriceSymbols = process.env.BINANCE_PRICE_SYMBOL.split(',');
    let decimals = process.env.COLLATERAL_DECIMALS.split(',');
    let params = process.env.VAULT_PARAMS.split(',');

    for (let index = 0; index < addresses.length; index++) {
        const element = names[index];
        col[element] = {
            contractAddress: getHexAddress(addresses[index]),
            factory: getHexAddress(factory[index]),
            binanceUrl: `${process.env.BINANCE_URL}${binancePriceSymbols[index]}`,
            symbol: binancePriceSymbols[index],
            decimals: decimals[index],
            param: params[index],
        };
    }
    return col;
};

const factories = (blockNumber) => {
    let fac = {};
    let addresses = process.env.COLLATERAL_ADDRESSES.split(',');
    let names = process.env.COLLATERAL_NAMES.split(',');
    let factory = process.env.VAULT_FACTORIES.split(',');
    let proxy = process.env.VAULT_PROXIES.split(',');
    let storage = process.env.VAULT_STORAGES.split(',');
    let params = process.env.VAULT_PARAMS.split(',');

    for (let index = 0; index < factory.length; index++) {
        const element = getHexAddress(factory[index]);
        let factoryAddress;
        let proxyAddress;
        if (checkpoints[names[index]]) {
            let sortedCheckpoints = checkpoints[names[index]].filter(function (a) {
                return parseInt(a.factory.block) <= parseInt(blockNumber);
            });
            sortedCheckpoints = sortedCheckpoints.sort((a, b) => a.factory.block < b.factory.block);
            if (sortedCheckpoints.length === 0) {
                factoryAddress = element;
                proxyAddress = getHexAddress(proxy[index]);
            } else {
                logger.info(
                    `Using checkpointed factory address at block ${sortedCheckpoints[0].factory.block} for block ${blockNumber} for collateral ${names[index]}`
                );
                factoryAddress = getHexAddress(sortedCheckpoints[0].factory.address);
                proxyAddress = getHexAddress(sortedCheckpoints[0].proxy.address);
            }
        } else {
            factoryAddress = element;
            proxyAddress = getHexAddress(proxy[index]);
        }

        fac[factoryAddress] = {
            name: names[index],
            collateral: getHexAddress(addresses[index]),
            proxy: proxyAddress,
            storage: storage[index],
            param: params[index],
            blockNumber,
        };
    }
    return fac;
};

const proxies = (blockNumber) => {
    let pro = {};
    let addresses = process.env.COLLATERAL_ADDRESSES.split(',');
    let names = process.env.COLLATERAL_NAMES.split(',');
    let factory = process.env.VAULT_FACTORIES.split(',');
    let proxy = process.env.VAULT_PROXIES.split(',');
    let storage = process.env.VAULT_STORAGES.split(',');
    let params = process.env.VAULT_PARAMS.split(',');

    for (let index = 0; index < proxy.length; index++) {
        const element = getHexAddress(proxy[index]);
        let factoryAddress;
        let proxyAddress;
        if (checkpoints[names[index]]) {
            let sortedCheckpoints = checkpoints[names[index]].filter(function (a) {
                return parseInt(a.proxy.block) <= parseInt(blockNumber);
            });
            sortedCheckpoints = sortedCheckpoints.sort((a, b) => a.proxy.block < b.proxy.block);
            if (sortedCheckpoints.length === 0) {
                factoryAddress = getHexAddress(factory[index]);
                proxyAddress = element;
            } else {
                logger.info(
                    `Using checkpointed proxy address at block ${sortedCheckpoints[0].proxy.block} for block ${blockNumber} for collateral ${names[index]}`
                );
                factoryAddress = getHexAddress(sortedCheckpoints[0].factory.address);
                proxyAddress = getHexAddress(sortedCheckpoints[0].proxy.address);
            }
        } else {
            factoryAddress = getHexAddress(factory[index]);
            proxyAddress = element;
        }

        pro[proxyAddress] = {
            name: names[index],
            collateral: getHexAddress(addresses[index]),
            factory: factoryAddress,
            storage: storage[index],
            param: params[index],
            blockNumber,
        };
    }
    return pro;
};

const storages = () => {
    let sto = {};
    let addresses = process.env.COLLATERAL_ADDRESSES.split(',');
    let names = process.env.COLLATERAL_NAMES.split(',');
    let factory = process.env.VAULT_FACTORIES.split(',');
    let proxy = process.env.VAULT_PROXIES.split(',');
    let storage = process.env.VAULT_STORAGES.split(',');
    let params = process.env.VAULT_PARAMS.split(',');
    for (let index = 0; index < storage.length; index++) {
        const element = getHexAddress(storage[index]);
        sto[element] = {
            name: names[index],
            collateral: getHexAddress(addresses[index]),
            factory: factory[index],
            proxy: proxy[index],
            param: params[index],
        };
    }
    return sto;
};

const names = () => {
    let nam = {};
    let addresses = process.env.COLLATERAL_ADDRESSES.split(',');
    let names = process.env.COLLATERAL_NAMES.split(',');
    let factory = process.env.VAULT_FACTORIES.split(',');
    let proxy = process.env.VAULT_PROXIES.split(',');
    let storage = process.env.VAULT_STORAGES.split(',');
    let params = process.env.VAULT_PARAMS.split(',');
    for (let index = 0; index < names.length; index++) {
        const element = names[index];
        nam[element] = {
            storage: storage[index],
            collateral: getHexAddress(addresses[index]),
            factory: factory[index],
            proxy: proxy[index],
            param: params[index],
        };
    }
    return nam;
};

const pillarToken = () => {
    return getHexAddress(process.env.PILLAR_TOKEN);
};

const gzilToken = () => {
    return getHexAddress(process.env.GZIL_TOKEN);
};

const stakingContract = () => {
    return getHexAddress(process.env.STAKING_CONTRACT.toLowerCase());
};

const delegationContract = () => {
    return getHexAddress(process.env.DELEGATION_CONTRACT.toLowerCase());
};

const getPillarTokenDecimals = () => {
    return parseInt(process.env.PILLAR_DECIMAL);
};

const rewardContract = () => {
    return getHexAddress(process.env.REWARD_CONTRACT.toLowerCase());
};
const getContractState = async (contractAddress) => {
    const deployedContract = zilliqa.contracts.at(contractAddress);
    const state = await deployedContract.getState();
    return state;
};

const getContractSubState = async (contractAddress, param, indices) => {
    const deployedContract = zilliqa.contracts.at(contractAddress);
    if (indices) {
        indices = indices.map((i) => i.toLowerCase());
        const state = await deployedContract.getSubState(param, indices);
        return state;
    } else {
        const state = await deployedContract.getSubState(param);
        return state;
    }
};

module.exports = {
    getLatestBlockData,
    getTransactions,
    getTransactionBlock,
    getHexAddress,
    getCollaterals: collaterals,
    getPillarToken: pillarToken,
    getFactories: factories,
    getStorages: storages,
    getProxies: proxies,
    getNames: names,
    getContractState,
    collateralToAddressMap,
    getContractSubState,
    getPillarTokenDecimals,
    schnorr,
    sha256,
    getAddressFromPublicKey,
    gzilToken,
    stakingContract,
    delegationContract,
    rewardContract,
};
