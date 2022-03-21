const logger = require('../logger')(module);
const {
    events: {
        ProxyEvents: { RegisterCollateral, PriceUpdated, SignatureValid, RawDataToVerifySignature, TransferOwnership },
    },
} = require('../constants');
const { onChainPrices } = require('../models');

const processEvents = async (events, collection, updatedAt) => {
    for (let index = 0; index < events.length; index++) {
        const event = events[index];
        if ([RegisterCollateral, SignatureValid, RawDataToVerifySignature, TransferOwnership].includes(event._eventname)) {
            await skip(event._eventname);
        } else if (event._eventname === PriceUpdated) {
            await _priceUpdate(event, collection, updatedAt);
        } else {
            console.log(event);
            throw Error(`Unhandled error ${event._eventname}`);
        }
    }
    return;
};

const _priceUpdate = async (event, collection, updatedAt) => {
    let collateral = event.params.filter((param) => param.vname === 'collateral')[0].value;
    let price = event.params.filter((param) => param.vname === 'price')[0].value;
    let decimals = event.params.filter((param) => param.vname === 'decimals')[0].value;

    let _onChainPrice = await onChainPrices.findOne({ collateral });
    if (_onChainPrice) {
        await onChainPrices.updateOne({ collateral }, { value: { col: collateral, price, decimals, blockNumber: updatedAt } });
    } else {
        await new onChainPrices({
            collateral,
            value: { col: collateral, price, decimals, blockNumber: updatedAt },
        }).save();
    }
};

const skip = async (name) => {
    logger.info(`Skipping ${name} event`);
};

module.exports = {
    processEvents,
};
