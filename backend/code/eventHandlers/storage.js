const logger = require('../logger')(module);
const {
    events: {
        StorageEvents: { Stat, TransferOwnership },
    },
} = require('../constants');

const { generateVaultId } = require('../helpers');
const { vaults, collectives } = require('../models');

const processEvents = async (events, collection, updatedAt) => {
    for (let index = 0; index < events.length; index++) {
        const event = events[index];
        if ([Stat].includes(event._eventname)) {
            await _stat(event, collection, updatedAt);
        } else if ([TransferOwnership].includes(event._eventname)) {
            await skip(TransferOwnership);
        } else {
            throw Error(`Unhandled error ${event._eventname}`);
        }
    }
    return;
};

const skip = async (name) => {
    logger.info(`Skipping ${name} event`);
};

const _updateCollectives = async (collateral, { totalPillarMinted, totalPillarRepaid, totalCollateral }) => {
    let _collective = await collectives.findOne({ collateral });
    if (_collective) {
        await collectives.updateOne({ collateral }, { value: { totalPillarMinted, totalPillarRepaid, totalCollateral } });
    } else {
        await new collectives({
            collateral,
            value: { totalPillarMinted, totalPillarRepaid, totalCollateral },
        }).save();
    }
};

const _stat = async (event, collection, updatedAt) => {
    let vault_id = event.params.filter((param) => param.vname === 'vaultId')[0].value;

    let collateralAmount = event.params.filter((param) => param.vname === 'collateralAmount')[0].value;

    let pillarBorrowed = event.params.filter((param) => param.vname === 'pillarBorrowed')[0].value;

    let interestAccumulated = event.params.filter((param) => param.vname === 'interestAccumulated')[0].value;

    let totalPillarMinted = event.params.filter((param) => param.vname === 'totalPillarMinted')[0].value;

    let totalPillarRepaid = event.params.filter((param) => param.vname === 'totalPillarRepaid')[0].value;

    let totalCollateral = event.params.filter((param) => param.vname === 'totalCollateral')[0].value;

    let storages = collection.storages;
    //   console.log(storages[event.address]);
    let namePrefix = storages[event.address];
    if (!namePrefix) {
        throw new Error(`Address ${event.address} is not registered in factory env variables`);
    }

    let generatedVaultId = generateVaultId(namePrefix.name, vault_id);

    let _vault = await vaults.findOne({
        vaultId: generatedVaultId,
        collateral: namePrefix.name,
    });
    if (_vault) {
        await vaults.updateOne(
            { vaultId: generatedVaultId, collateral: namePrefix.name },
            { collateralAmount, pillarBorrowed, interestAccumulated, updatedAt }
        );
        await _updateCollectives(namePrefix.name, {
            totalPillarMinted,
            totalPillarRepaid,
            totalCollateral,
        });
    } else {
        throw new Error('Cannot update an unregistered vault');
    }
};

module.exports = {
    processEvents,
};
