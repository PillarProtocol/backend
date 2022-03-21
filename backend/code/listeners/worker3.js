const { collateralToAddressMap, getLatestBlockData } = require('../zil_lib');
const { prices } = require('../models');
const logger = require('../logger')(module);
const { Binance } = require('../constants');
const axios = require('axios');

const updatePrice = async () => {
    let data = await getLatestBlockData();
    for (let key in collateralToAddressMap()) {
        let { binanceUrl: url, symbol } = collateralToAddressMap()[key];
        const {
            data: { price },
        } = await axios.get(url);
        await updateObject(key, Binance, symbol, price, data.NumTxBlocks);
    }
    return;
};

const updateObject = async (collateral, source, symbol, value, updatedAt) => {
    let _price = await prices.findOne({ collateral, source });
    if (_price) {
        await prices.updateOne({ collateral, source }, { symbol, value, updatedAt });
    } else {
        await new prices({ collateral, source, value, updatedAt, symbol }).save();
    }
    // console.log({ collateral, source ,value, updatedAt });
    logger.info(`Updated Price from ${source}. ${collateral}: ${value} at ${updatedAt}. Symbol: ${symbol}`);
    return;
};

module.exports = {
    updatePrice,
};
