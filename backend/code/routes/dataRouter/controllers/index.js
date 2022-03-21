const welcome = require('./welcome');
const collaterals = require('./collaterals');
const myVaults = require('./myVaults');
const totalPillar = require('./totalPillar');
const totalPillarRepaid = require('./totalPillarRepaid');
const totalCollateral = require('./totalCollateral');
const transactions = require('./transactions');
const factory = require('./factory');
const allVaults = require('./allVaults');
const vaultTransactions = require('./vaultTransactions');
const vault = require('./vault');
const approvedCollateral = require('./approvedCollateral');
const approvedGzil = require('./approvedGzil');
const approvedPillar = require('./approvedPillar');
const price = require('./price');
const balance = require('./balance');
const pillarBalance = require('./pillarBalance');
const userConsent = require('./userConsent');
const checkUserConsent = require('./checkUserConsent');
const consents = require('./consents');
const userShares = require('./userShares');
const delegation = require('./delegation');
const gzilBalance = require('./gzilBalance');
const indivisual_delegation = require('./indivisual_delegation');
const pending_delegation = require('./pending_delegation');
const delegatorList = require('./delegatorList');
const rewardList = require('./rewardList');
const unlockingRequests = require('./unlockingRequests');
const gzilLockedinStakingContract = require('./gzilLockedinStakingContract');
const allUnlockingRequests = require('./allUnlockingRequests');

module.exports = {
    allUnlockingRequests,
    gzilLockedinStakingContract,
    unlockingRequests,
    rewardList,
    delegatorList,
    welcome,
    userShares,
    pillarBalance,
    collaterals,
    myVaults,
    totalPillar,
    totalPillarRepaid,
    totalCollateral,
    transactions,
    factory,
    allVaults,
    vaultTransactions,
    vault,
    approvedCollateral,
    approvedPillar,
    price,
    balance,
    userConsent,
    checkUserConsent,
    consents,
    approvedGzil,
    delegation,
    gzilBalance,
    indivisual_delegation,
    pending_delegation,
};
