const { getLatestBlockData } = require('../zil_lib');
const { params } = require('../models');
const logger = require('../logger')(module);

const { latestBlock, latestDsEpoch, latestMiniEpoch } = require('../constants');

const updateLatestBlock = async () => {
    if (parseInt(process.env.PAUSE_BLOCK) != 0) {
        logger.info(`Worker 1 Parser has been manually stopped. Latest block won't be updated`);
        return null;
    }
    let data = await getLatestBlockData();
    // console.log(data);
    await updateObject(latestBlock, data.NumTxBlocks);
    await updateObject(latestDsEpoch, data.CurrentDSEpoch);
    await updateObject(latestMiniEpoch, data.CurrentMiniEpoch);
    return data;
};

const updateObject = async (key, value) => {
    await params.updateOne({ param: key }, { value });
    logger.info(`Updated ${key}: ${value}`);
    return;
};
module.exports = {
    updateLatestBlock,
};
