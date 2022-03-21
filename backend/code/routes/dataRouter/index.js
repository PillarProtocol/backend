const express = require('express');
const router = express.Router();
const { validate } = require('express-validation');

const { verifyUserConsentPayload } = require('./postRequestPayloadCheck');

const {
    welcome,
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
    pillarBalance,
    userConsent,
    checkUserConsent,
    consents,
    approvedGzil,
    delegation,
    gzilBalance,
    indivisual_delegation,
    pending_delegation,
    userShares,
    delegatorList,
    rewardList,
    unlockingRequests,
    gzilLockedinStakingContract,
    allUnlockingRequests,
} = require('./controllers');

const {
    validateAddress,
    validateCollateralType,
    validateVaultId,
    validatePaginationData,
    validatePriceRequest,
    verifyUserConsent,
} = require('./middlewares');

router.get('/', welcome);

router.get('/collaterals', collaterals);

router.get('/myVaults/:address', validateAddress, myVaults);

router.get('/totalPillar', totalPillar);

router.get('/totalPillarRepaid', totalPillarRepaid);

router.get('/totalCollateral', totalCollateral);

router.get('/transactions/:type', validateCollateralType, validatePaginationData, transactions);

router.get('/factory/:type', validateCollateralType, factory);

router.get('/allVaults/:type', validateCollateralType, validatePaginationData, allVaults);

router.get('/vaultTransactions/:type/:vaultId', validateCollateralType, validateVaultId, validatePaginationData, vaultTransactions);

router.get('/vault/:type/:vaultId', validateCollateralType, validateVaultId, validatePaginationData, vault);

router.get('/approvedCollateral/:type/:address', validateCollateralType, validateAddress, approvedCollateral);

router.get('/approvedGzil/:address', validateAddress, approvedGzil);

router.get('/approvedPillar/:type/:vaultId/:address', validateCollateralType, validateVaultId, validateAddress, approvedPillar);

router.get('/price/:type', validatePriceRequest, price);

router.get('/balance/:type/:address', validateCollateralType, validateAddress, balance);

router.get('/delegation/:address', validateAddress, delegation);

router.get('/userShares/:address', validateAddress, userShares);

router.get('/indivisualDelegation/:address', validateAddress, indivisual_delegation);

router.get('/pendingDelegation/:address', validateAddress, pending_delegation);

router.get('/pillarBalance/:address', validateAddress, pillarBalance);

router.get('/gzilBalance/:address', validateAddress, gzilBalance);

router.post('/userConsent', validate(verifyUserConsentPayload), verifyUserConsent, userConsent);

router.get('/userConsents', validatePaginationData, consents);

router.get('/checkUserConsent/:address', validateAddress, checkUserConsent);

router.get('/delegatorList', delegatorList);

router.get('/rewardList/:address', validateAddress, rewardList);

router.get('/unlockingRequest/:address', validateAddress, unlockingRequests);

router.get('/gzilLockedinStakingContract', gzilLockedinStakingContract);

router.get('/allUnlockingRequests', allUnlockingRequests);

module.exports = router;
