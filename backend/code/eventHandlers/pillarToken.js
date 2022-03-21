const logger = require('../logger')(module);
const {
    events: {
        PillarTokenEvents: {
            Minted,
            IncreasedAllowance,
            TransferSuccess,
            TransferFromSuccess,
            BurnFromSuccess,
            Burnt,
            TransferOwnership,
            DecreasedAllowance,
        },
    },
} = require('../constants');

const processEvents = async (events, collection, updatedAt) => {
    for (let index = 0; index < events.length; index++) {
        const event = events[index];
        if (
            [
                Minted,
                IncreasedAllowance,
                DecreasedAllowance,
                TransferSuccess,
                TransferFromSuccess,
                BurnFromSuccess,
                Burnt,
                TransferOwnership,
            ].includes(event._eventname)
        ) {
            await skip(event._eventname);
        } else {
            throw Error(`Unhandled error ${event._eventname}`);
        }
    }
    return;
};

const skip = async (name) => {
    logger.info(`Skipping ${name} event`);
};

module.exports = {
    processEvents,
};
