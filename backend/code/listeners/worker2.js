const { getAddressFromPublicKey } = require('@zilliqa-js/crypto');

const {
    getTransactions,
    getTransactionBlock,
    getHexAddress,
    getCollaterals,
    getFactories,
    getProxies,
    getStorages,
    getPillarToken,
    stakingContract,
    delegationContract,
    rewardContract,
} = require('../zil_lib');
const { params } = require('../models');

const logger = require('../logger')(module);
const { lastConfirmedBlock, latestBlock } = require('../constants');
const { induceDelay, errorDelay, print } = require('../helpers');
const eventHandlers = require('../eventHandlers');

const confirmations = parseInt(process.env.CONFIRMATIONS);

const confirmBlock = async () => {
    let { updateRequired, _lastConfirmed } = await isUpdateRequired();

    const collaterals = getCollaterals();
    const pillarToken = getPillarToken();
    const staking = stakingContract();
    const delegation = delegationContract();
    const factories = getFactories(_lastConfirmed);
    const proxies = getProxies(_lastConfirmed);
    const storages = getStorages();
    const reward = rewardContract();

    // console.log({factories, proxies});

    if (updateRequired) {
        let txBlock = await getTransactionBlock(_lastConfirmed);
        if (txBlock.error) {
            throw new Error(txBlock.error);
        }

        // console.log({ collaterals, pillarToken, factories, proxies, storages });

        if (!(txBlock.result && txBlock.result.header && parseInt(txBlock.result.header.NumTxns) == 0)) {
            let timestamp = parseInt(txBlock.result.header.Timestamp);
            let txns = await getTransactions(_lastConfirmed);
            if (txns.error && txns.error.code == -20) {
                logger.error(`failed to get micro block ${_lastConfirmed}. Skipping this block and moving to next`);
                await updateLastConfirmedBlock(_lastConfirmed);
                await induceDelay(errorDelay);
                return;
            }
            let receipts = txns.result.filter((txn) => txn.receipt && txn.receipt.success);
            receipts = receipts.map((receipt) => {
                return {
                    ...receipt,
                    senderAddress: getAddressFromPublicKey(receipt.senderPubKey),
                    toAddr: getHexAddress(receipt.toAddr),
                };
            });
            let filteredReceipts = receipts.filter((elem) => elem.receipt.event_logs);
            if (filteredReceipts.length > 0) {
                let allEvents = filteredReceipts.reduce((accumulator, item, index) => {
                    let modifiedLogs = item.receipt.event_logs.map((event_log, i) => {
                        return {
                            ...event_log,
                            transactionHash: item.ID,
                            transactionIndex: index,
                            eventIndex: i,
                            timestamp,
                            data: item.data,
                        };
                    });
                    accumulator.push(...modifiedLogs);
                    return accumulator;
                }, []);

                let filteredEvents = allEvents.map((event) => {
                    return {
                        ...event,
                        address: getHexAddress(event.address),
                    };
                });

                // print(filteredEvents);
                let vaultFactoryEvents = filteredEvents.filter((event) => factories[event.address]);
                let pillarTokenEvents = filteredEvents.filter((event) => event.address === pillarToken);

                let collateralTokenEvents = filteredEvents.filter((event) => collaterals[event.address]);

                let proxyEvents = filteredEvents.filter((event) => proxies[event.address]);
                let storageEvents = filteredEvents.filter((event) => storages[event.address]);

                let stakingEvents = filteredEvents.filter((event) => {
                    return event.address === staking;
                });

                let delegationEvents = filteredEvents.filter((event) => event.address === delegation);

                let rewardEvents = filteredEvents.filter((event) => {
                    return event.address === reward;
                });

                let otherEvents = filteredEvents.filter((event) => {
                    return !(
                        factories[event.address] ||
                        event.address === pillarToken ||
                        event.address === staking ||
                        event.address === delegation ||
                        collaterals[event.address] ||
                        proxies[event.address] ||
                        event.address === reward ||
                        storages[event.address]
                    );
                });

                if (proxyEvents.length > 0) {
                    const {
                        proxyEvents: { processEvents },
                    } = eventHandlers;
                    await processEvents(proxyEvents, { factories, collaterals, proxies, storages }, _lastConfirmed);
                }

                if (vaultFactoryEvents.length > 0) {
                    const {
                        vaultFactoryEvents: { processEvents },
                    } = eventHandlers;
                    await processEvents(vaultFactoryEvents, { factories, collaterals, proxies, storages }, _lastConfirmed);
                }

                if (collateralTokenEvents.length > 0) {
                    const {
                        collateralTokenEvents: { processEvents },
                    } = eventHandlers;
                    await processEvents(collateralTokenEvents, { factories, collaterals, proxies, storages }, _lastConfirmed);
                }

                if (pillarTokenEvents.length > 0) {
                    const {
                        pillarTokenEvents: { processEvents },
                    } = eventHandlers;
                    await processEvents(pillarTokenEvents, { factories, collaterals, proxies, storages }, _lastConfirmed);
                }

                if (storageEvents.length > 0) {
                    const {
                        storageEvents: { processEvents },
                    } = eventHandlers;
                    await processEvents(storageEvents, { factories, collaterals, proxies, storages }, _lastConfirmed);
                }

                if (stakingEvents.length > 0) {
                    const {
                        stakingEvents: { processEvents },
                    } = eventHandlers;
                    await processEvents(stakingEvents, { factories, collaterals, proxies, storages }, _lastConfirmed);
                }

                if (delegationEvents.length > 0) {
                    const {
                        DelegationEvents: { processEvents },
                    } = eventHandlers;
                    await processEvents(delegationEvents, { factories, collaterals, proxies, storages }, _lastConfirmed);
                }

                if (rewardEvents.length > 0) {
                    const {
                        RewardEvents: { processEvents },
                    } = eventHandlers;
                    await processEvents(rewardEvents, { factories, collaterals, proxies, storages }, _lastConfirmed);
                }
            }
        }
        await updateLastConfirmedBlock(_lastConfirmed);
        return;
    } else {
        logger.info(`Waiting ${errorDelay} ms for the new confirmed block`);
        await induceDelay(errorDelay);
        return;
    }
};

const isUpdateRequired = async () => {
    let { value: _lastConfirmed } = await params.findOne({
        param: lastConfirmedBlock,
    });

    if (parseInt(process.env.PAUSE_BLOCK) != 0 && parseInt(process.env.PAUSE_BLOCK) < _lastConfirmed + 1) {
        logger.info(`Worker2 parser has been manually stopped at block ${_lastConfirmed}`);
        return {
            updateRequired: false,
            _lastConfirmed,
        };
    }

    let { value: _latest } = await params.findOne({ param: latestBlock });
    if (confirmations > _latest - _lastConfirmed) {
        return {
            updateRequired: false,
            _lastConfirmed,
        };
    } else {
        return {
            updateRequired: true,
            _lastConfirmed,
            _latest,
        };
    }
};

const updateLastConfirmedBlock = async (blockNumber) => {
    await params.updateOne({ param: lastConfirmedBlock }, { $inc: { value: 1 } });
    logger.info(`Updated ${lastConfirmedBlock}: ${blockNumber + 1}`);
    return;
};

module.exports = {
    confirmBlock,
};
