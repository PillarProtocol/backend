const logger = require('../logger')(module);
const {
    events: {
        DelegateEvents: { UpdateDelegation, UpdateVotes, TransferOwnership },
    },
} = require('../constants');

const { delegations } = require('../models');

const processEvents = async (events, collection, updatedAt) => {
    for (let index = 0; index < events.length; index++) {
        const event = events[index];
        if ([UpdateDelegation, TransferOwnership].includes(event._eventname)) {
            await skip(event._eventname);
        } else if (UpdateVotes === event._eventname) {
            await processUpdateVotes(event, collection, updatedAt);
        } else {
            console.log(event);
            throw Error(`Unhandled error ${event._eventname}`);
        }
    }
    return;
};

const processUpdateVotes = async (event, collection, updatedAt) => {
    // delegatorShares oldDelegateeVotes newDelegateeVotes delegator oldDelegatee newDelegatee
    let oldDelegatee =
        event.params.filter((param) => param.vname === 'oldDelegatee').length > 0
            ? event.params.filter((param) => param.vname === 'oldDelegatee')[0].value
            : 'oldDelegatee';
    let newDelegatee =
        event.params.filter((param) => param.vname === 'newDelegatee').length > 0
            ? event.params.filter((param) => param.vname === 'newDelegatee')[0].value
            : 'newDelegatee';

    let oldDelegateeVotes = event.params.filter((param) => param.vname === 'oldDelegateeVotes')[0].value;
    let newDelegateeVotes = event.params.filter((param) => param.vname === 'newDelegateeVotes')[0].value;

    await updateDelegation(oldDelegatee, oldDelegateeVotes);
    await updateDelegation(newDelegatee, newDelegateeVotes);
    return;
};

const updateDelegation = async (user, stake) => {
    let _temp = await delegations.findOne({ user });
    if (_temp) {
        await delegations.updateOne({ user }, { stake });
    } else {
        await new delegations({ user, stake }).save();
    }
    return;
};

const skip = async (name) => {
    logger.info(`Skipping ${name} event`);
};

module.exports = {
    processEvents,
};
