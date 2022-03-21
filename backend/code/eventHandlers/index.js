const proxyEvents = require('./proxy');
const vaultFactoryEvents = require('./vaultFactory');
const storageEvents = require('./storage');
const collateralTokenEvents = require('./collateralToken');
const pillarTokenEvents = require('./pillarToken');
const stakingEvents = require('./staking');
const DelegationEvents = require('./delegation');
const RewardEvents = require('./reward');

module.exports = {
    proxyEvents,
    vaultFactoryEvents,
    storageEvents,
    collateralTokenEvents,
    pillarTokenEvents,
    stakingEvents,
    DelegationEvents,
    RewardEvents,
};
