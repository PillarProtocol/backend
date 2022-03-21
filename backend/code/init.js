const { params } = require('./models');
const { latestBlock, lastConfirmedBlock, latestDsEpoch, latestMiniEpoch } = require('./constants');

init = async () => {
    await check(latestBlock, parseInt(process.env.START_BLOCK));
    await check(lastConfirmedBlock, parseInt(process.env.START_BLOCK));
    await check(latestDsEpoch, parseInt(process.env.START_BLOCK / 100));
    await check(latestMiniEpoch, parseInt(process.env.START_BLOCK));
    return 'Init Complete';
};
async function check(param, value) {
    let _param = await params.findOne({ param });
    if (!_param) {
        await new params({ param, value }).save();
    }
    return;
}

module.exports = init;
