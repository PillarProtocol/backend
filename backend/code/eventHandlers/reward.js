const logger = require('../logger')(module);
const {
    events: {
        RewardEvents: { RewardTokenForEpoch, RecordReward, ClaimReward },
    },
} = require('../constants');

const { rewardPerEpoch, userRewards } = require('../models');

const processEvents = async (events, collection, updatedAt) => {
    for (let index = 0; index < events.length; index++) {
        const event = events[index];
        if ([].includes(event._eventname)) {
            await skip(event._eventname);
        } else if (event._eventname === RewardTokenForEpoch) {
            await processRewardTokenForEpoch(event, collection, updatedAt);
        } else if (event._eventname === RecordReward) {
            await processRecordReward(event, collection, updatedAt);
        } else if (ClaimReward === event._eventname) {
            await processClaimReward(event, collection, updatedAt);
        } else {
            console.log(event);
            throw Error(`Unhandled error ${event._eventname}`);
        }
    }
    return;
};

const skip = async (name) => {
    logger.info(`Skipping ${name} event`);
};

const processRewardTokenForEpoch = async (event, collection, updatedAt) => {
    let epoch = event.params.filter((param) => param.vname === 'epoch')[0].value;
    let token = event.params.filter((param) => param.vname === 'collateralToken')[0].value;

    let _temp = await rewardPerEpoch.findOne({ epoch });
    if (_temp) {
        await rewardPerEpoch.updateOne({ epoch }, { token });
    } else {
        await new rewardPerEpoch({ epoch, token }).save();
    }
};

const processRecordReward = async (event, collection, updatedAt) => {
    let epochs = event.params.filter((param) => param.vname === 'epoch');
    let addresses = event.params.filter((param) => param.vname === 'address');
    let amounts = event.params.filter((param) => param.vname === 'amount');

    for (let index = 0; index < epochs.length; index++) {
        const epoch = epochs[index].value;
        const address = addresses[index].value;
        const amount = amounts[index].value;
        let _temp = await userRewards.findOne({ epoch, address });
        if (_temp) {
            await userRewards.updateOne({ epoch, address }, { amount });
        } else {
            await new userRewards({ epoch, address, amount }).save();
        }
    }
};

const processClaimReward = async (event, collection, updatedAt) => {
    let epochs = event.params.filter((param) => param.vname === 'epoch');
    let addresses = event.params.filter((param) => param.vname === 'address');
    let amounts = event.params.filter((param) => param.vname === 'amount');

    for (let index = 0; index < epochs.length; index++) {
        const epoch = epochs[index].value;
        const address = addresses[index].value;
        const amount = amounts[index].value;
        await userRewards.updateOne({ epoch, address }, { claimed: true });
    }
};

module.exports = {
    processEvents,
};
