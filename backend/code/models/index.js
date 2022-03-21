const params = require('./params');
const vaults = require('./vaults');
const transactions = require('./transactions');
const prices = require('./prices');
const collectives = require('./collectives');
const onChainPrices = require('./onChainPrices');
const userConsent = require('./userConsent');
const staking = require('./staking');
const unlockingRequest = require('./unlockingRequests');
const delegations = require('./delegation');
const userRewards = require('./userRewards');
const rewardPerEpoch = require('./rewardPerEpoch');

module.exports = {
    params,
    vaults,
    transactions,
    prices,
    collectives,
    onChainPrices,
    userConsent,
    staking,
    unlockingRequest,
    delegations,
    rewardPerEpoch,
    userRewards,
};
