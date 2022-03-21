const logger = require('../logger')(module);
const {
    events: {
        StakingEvents: {
            LockedTokens,
            ChangeDelegationContract,
            RecipientAcceptTransferFrom,
            TransferFromSuccessCallBack,
            NewUnlockRequest,
            DeleteUnlockRequest,
            WithdrawTokens,
            TransferOwnership,
            TransferSuccessCallBack,
        },
    },
} = require('../constants');

const { params, staking, unlockingRequest } = require('../models');

const processEvents = async (events, collection, updatedAt) => {
    for (let index = 0; index < events.length; index++) {
        const event = events[index];
        if (LockedTokens === event._eventname) {
            await processLockedTokens(event, collection, updatedAt);
        } else if (
            [
                ChangeDelegationContract,
                RecipientAcceptTransferFrom,
                TransferFromSuccessCallBack,
                TransferOwnership,
                TransferSuccessCallBack,
            ].includes(event._eventname)
        ) {
            await skip(ChangeDelegationContract);
        } else if (NewUnlockRequest === event._eventname) {
            await processUnlockRequest(event, collection, updatedAt);
        } else if (DeleteUnlockRequest === event._eventname) {
            await processDeleteRequest(event, collection, updatedAt);
        } else if (WithdrawTokens === event._eventname) {
            await processWithdrawTokens(event, collection, updatedAt);
        } else {
            throw Error(`Unhandled error ${event._eventname}`);
        }
    }
    return;
};

const processWithdrawTokens = async (event, collection, updatedAt) => {
    // e = {_eventname: "WithdrawTokens"; totalShares: newTotalShares; totalGzilLocked: newTotalGZil;
    // userTotalShares: newUserShares; shares: shares; user: _sender; amountReleased: amount
    // };

    let totalShares = event.params.filter((param) => param.vname === 'totalShares')[0].value;
    let totalGzilLocked = event.params.filter((param) => param.vname === 'totalGzilLocked')[0].value;
    let userTotalShares = event.params.filter((param) => param.vname === 'userTotalShares')[0].value;

    let amountReleased = event.params.filter((param) => param.vname === 'amountReleased')[0].value;
    let user = event.params.filter((param) => param.vname === 'user')[0].value;
    let shares = event.params.filter((param) => param.vname === 'shares')[0].value;
    logger.info(`User: ${user} has released ${shares} on withdrawing amount: ${amountReleased}`);

    // params: [ { vname: 'requestId', type: 'Uint128', value: '4' } ]

    const inputParams = JSON.parse(event.data).params;
    const requestId = inputParams.filter((param) => param.vname === 'requestId')[0].value;

    await unlockingRequest.updateOne({ requestId }, { status: 'Unlocked' });

    await checkAndUpdateParam('totalShares', totalShares);
    await checkAndUpdateParam('totalGzilLocked', totalGzilLocked);
    await checkAndUpdateStake(user, userTotalShares);
};

const processDeleteRequest = async (event, collection, updatedAt) => {
    // DeleteUnlockRequest (Uint128 requestId)
    let requestId = event.params.filter((param) => param.vname === 'requestId')[0].value;
    await unlockingRequest.updateOne({ requestId }, { status: 'Cancelled' });
    return;
};

const processUnlockRequest = async (event, collection, updatedAt) => {
    // NewUnlockRequest (Uint128 shares, ByStr20 user, Uint128 requestId, BNum block)
    let shares = event.params.filter((param) => param.vname === 'shares')[0].value;
    let user = event.params.filter((param) => param.vname === 'user')[0].value;
    let requestId = event.params.filter((param) => param.vname === 'requestId')[0].value;
    let block = event.params.filter((param) => param.vname === 'block')[0].value;

    let _temp = await unlockingRequest.findOne({ requestId });
    if (_temp) {
        logger.info(`${requestId} is already registered`);
    } else {
        await new unlockingRequest({ requestId, shares, user, block }).save();
    }
    return;
};

const processLockedTokens = async (event, collection, updatedAt) => {
    // LockedTokens (Uint128 totalShares, Uint128 totalGzilLocked, Uint128 userTotalShares, Uint128 amount, ByStr20 user, Uint128 sharesObtained)
    let totalShares = event.params.filter((param) => param.vname === 'totalShares')[0].value;
    let totalGzilLocked = event.params.filter((param) => param.vname === 'totalGzilLocked')[0].value;
    let userTotalShares = event.params.filter((param) => param.vname === 'userTotalShares')[0].value;
    let amount = event.params.filter((param) => param.vname === 'amount')[0].value;
    let user = event.params.filter((param) => param.vname === 'user')[0].value;
    let sharesObtained = event.params.filter((param) => param.vname === 'sharesObtained')[0].value;
    logger.info(`User: ${user} has obtained ${sharesObtained} on locking amount: ${amount}`);

    await checkAndUpdateParam('totalShares', totalShares);
    await checkAndUpdateParam('totalGzilLocked', totalGzilLocked);
    await checkAndUpdateStake(user, userTotalShares);

    return;
};

const checkAndUpdateParam = async (param, value) => {
    let _temp = await params.findOne({ param });
    if (_temp) {
        await params.updateOne({ param }, { value });
    } else {
        await new params({ param, value }).save();
    }
    return;
};

const checkAndUpdateStake = async (user, shares) => {
    let _temp = await staking.findOne({ user });
    if (_temp) {
        await staking.updateOne({ user }, { shares });
    } else {
        await new staking({ user, shares }).save();
    }
    return;
};

const skip = async (name) => {
    logger.info(`Skipping ${name} event`);
};

module.exports = {
    processEvents,
};
