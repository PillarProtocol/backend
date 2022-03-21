const logger = require('../logger')(module);
const { vaults, transactions } = require('../models');
const {
    events: {
        VaultFactoryEvents: {
            CreateNewVault,
            AddCollateral,
            RecipientAcceptTransferFrom,
            TransferFromSuccessCallBack,
            MintPillar,
            Repay,
            MintSuccessCallBack,
            CollateralizationRatio,
            BurnFromSuccessCallBack,
            Liquidate,
            TransferSuccessCallBack,
            ReleaseCollateral,
            MarginalInterest,
        },
    },
} = require('../constants');

const { generateVaultId, generateUniqueVaultId } = require('../helpers');
const { getHexAddress } = require('../zil_lib');

const processEvents = async (events, collection, updatedAt) => {
    for (let index = 0; index < events.length; index++) {
        const event = events[index];
        if (event._eventname === CreateNewVault) {
            await _createNewVault(event, collection, updatedAt);
        } else if (event._eventname === AddCollateral) {
            await _addCollateral(event, collection, updatedAt);
        } else if (
            [
                RecipientAcceptTransferFrom,
                TransferFromSuccessCallBack,
                MintSuccessCallBack,
                BurnFromSuccessCallBack,
                TransferSuccessCallBack,
                MarginalInterest,
            ].includes(event._eventname)
        ) {
            await skip(event._eventname);
        } else if ([CollateralizationRatio].includes(event._eventname)) {
            await printEvent(event);
        } else if (event._eventname === MintPillar) {
            await _mintPillar(event, collection, updatedAt);
        } else if (event._eventname === Repay) {
            await _repay(event, collection, updatedAt);
        } else if (event._eventname === Liquidate) {
            await _liquidate(event, collection, updatedAt);
        } else if (event._eventname === ReleaseCollateral) {
            await _releaseCollateral(event, collection, updatedAt);
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

const printEvent = async (event) => {
    logger.info(`Skipping ${event._eventname} event`);
    // use this if needed
    // console.log(event);
    // throw new Error("Stopped manually");
};

const _releaseCollateral = async (event, collection, updatedAt) => {
    // console.log(event);
    let vault_id = event.params.filter((param) => param.vname === 'vault_id')[0].value;
    let amount = event.params.filter((param) => param.vname === 'amount')[0].value;

    let factories = collection.factories;
    let namePrefix = factories[event.address];
    if (!namePrefix) {
        throw new Error(`Address ${event.address} is not registered in factory env variables`);
    }

    let generatedVaultId = generateVaultId(namePrefix.name, vault_id);
    let vaultUniqueId = generateUniqueVaultId(namePrefix.name, vault_id);

    let { transactionHash, transactionIndex, eventIndex, timestamp } = event;
    let _transaction = await transactions.findOne({
        transactionHash,
        transactionIndex,
        eventIndex,
    });

    if (!_transaction) {
        await new transactions({
            transactionHash,
            transactionIndex,
            eventIndex,
            vaultId: generatedVaultId,
            vaultUniqueId,
            timestamp,
            operation: ReleaseCollateral,
            amount,
            collateral: namePrefix.name,
        }).save();
    } else {
        logger.warn(`transactionHash-transactionHash-eventIndex already registered ${transactionHash}-${transactionIndex}-${eventIndex}`);
    }
};

const _liquidate = async (event, collection, updatedAt) => {
    // console.log(event);
    let vault_id = event.params.filter((param) => param.vname === 'vault_id')[0].value;
    let interestPaid = event.params.filter((param) => param.vname === 'interestPaid')[0].value;
    let principlePaid = event.params.filter((param) => param.vname === 'principlePaid')[0].value;
    let newOwner = event.params.filter((param) => param.vname === 'newOwner')[0].value;

    let factories = collection.factories;
    let namePrefix = factories[event.address];
    if (!namePrefix) {
        throw new Error(`Address ${event.address} is not registered in factory env variables`);
    }

    let generatedVaultId = generateVaultId(namePrefix.name, vault_id);
    let vaultUniqueId = generateUniqueVaultId(namePrefix.name, vault_id);

    let { transactionHash, transactionIndex, eventIndex, timestamp } = event;
    let _transaction = await transactions.findOne({
        transactionHash,
        transactionIndex,
        eventIndex,
    });

    if (!_transaction) {
        await new transactions({
            transactionHash,
            transactionIndex,
            eventIndex,
            vaultId: generatedVaultId,
            vaultUniqueId,
            timestamp,
            operation: Liquidate,
            collateral: namePrefix.name,
            amount: `${parseInt(interestPaid) + parseInt(principlePaid)}`,
            details: {
                principleCleared: principlePaid,
                interestCleared: interestPaid,
                newOwner,
            },
        }).save();
    } else {
        logger.warn(`transactionHash-transactionHash-eventIndex already registered ${transactionHash}-${transactionIndex}-${eventIndex}`);
    }

    await vaults.updateOne({ vaultId: generatedVaultId, collateral: namePrefix.name }, { updatedAt, owner: getHexAddress(newOwner) });
};

const _repay = async (event, collection, updatedAt) => {
    // console.log(event);
    let vault_id = event.params.filter((param) => param.vname === 'vault_id')[0].value;

    let interestPaid = event.params.filter((param) => param.vname === 'interestPaid')[0].value;

    let principlePaid = event.params.filter((param) => param.vname === 'principlePaid')[0].value;

    let factories = collection.factories;
    let namePrefix = factories[event.address];
    if (!namePrefix) {
        throw new Error(`Address ${event.address} is not registered in factory env variables`);
    }

    let generatedVaultId = generateVaultId(namePrefix.name, vault_id);
    let vaultUniqueId = generateUniqueVaultId(namePrefix.name, vault_id);

    let { transactionHash, transactionIndex, eventIndex, timestamp } = event;
    let _transaction = await transactions.findOne({
        transactionHash,
        transactionIndex,
        eventIndex,
    });

    if (!_transaction) {
        await new transactions({
            transactionHash,
            transactionIndex,
            eventIndex,
            vaultId: generatedVaultId,
            vaultUniqueId,
            timestamp,
            operation: Repay,
            collateral: namePrefix.name,
            amount: `${parseInt(interestPaid) + parseInt(principlePaid)}`,
            details: {
                principleCleared: principlePaid,
                interestCleared: interestPaid,
            },
        }).save();
    } else {
        logger.warn(`transactionHash-transactionHash-eventIndex already registered ${transactionHash}-${transactionIndex}-${eventIndex}`);
    }
    // throw new Error("Testing");
};

const _addCollateral = async (event, collection, updatedAt) => {
    // console.log(event);
    // console.log(collection);
    let vault_id = event.params.filter((param) => param.vname === 'vault_id')[0].value;

    let amount = event.params.filter((param) => param.vname === 'amount')[0].value;

    let factories = collection.factories;
    let namePrefix = factories[event.address];
    if (!namePrefix) {
        throw new Error(`Address ${event.address} is not registered in factory env variables`);
    }

    let generatedVaultId = generateVaultId(namePrefix.name, vault_id);
    let vaultUniqueId = generateUniqueVaultId(namePrefix.name, vault_id);

    let { transactionHash, transactionIndex, eventIndex, timestamp } = event;
    let _transaction = await transactions.findOne({
        transactionHash,
        transactionIndex,
        eventIndex,
    });
    if (!_transaction) {
        await new transactions({
            transactionHash,
            transactionIndex,
            eventIndex,
            vaultId: generatedVaultId,
            vaultUniqueId,
            timestamp,
            collateral: namePrefix.name,
            operation: AddCollateral,
            amount,
        }).save();
    } else {
        logger.warn(`transactionHash-transactionHash-eventIndex already registered ${transactionHash}-${transactionIndex}-${eventIndex}`);
    }
};

const _createNewVault = async (event, collection, updatedAt) => {
    //   console.log({ params: event.params });
    let vault_id = event.params.filter((param) => param.vname === 'vault_id')[0].value;
    let owner = event.params.filter((param) => param.vname === 'owner')[0].value;
    //   console.log({ vault_id, owner });
    //   console.log(collection);
    let factories = collection.factories;
    let namePrefix = factories[event.address];
    if (!namePrefix) {
        throw new Error(`Address ${event.address} is not registered in factory env variables`);
    }

    let generatedVaultId = generateVaultId(namePrefix.name, vault_id);
    let vaultUniqueId = generateUniqueVaultId(namePrefix.name, vault_id);

    let _vault = await vaults.findOne({
        vaultId: generatedVaultId,
        collateral: namePrefix.name,
    });
    if (_vault) {
        logger.info(`Vault ${generatedVaultId} has already been registered`);
    } else {
        await new vaults({
            vaultId: generatedVaultId,
            collateral: namePrefix.name,
            owner: getHexAddress(owner),
            updatedAt,
            createdAt: event.timestamp,
            vaultUniqueId,
        }).save();
    }
    return;
};

const _mintPillar = async (event, collection, updatedAt) => {
    let vault_id = event.params.filter((param) => param.vname === 'vault_id')[0].value;

    let amount = event.params.filter((param) => param.vname === 'amount')[0].value;

    let factories = collection.factories;
    let namePrefix = factories[event.address];
    if (!namePrefix) {
        throw new Error(`Address ${event.address} is not registered in factory env variables`);
    }

    let generatedVaultId = generateVaultId(namePrefix.name, vault_id);
    let vaultUniqueId = generateUniqueVaultId(namePrefix.name, vault_id);

    let { transactionHash, transactionIndex, eventIndex, timestamp } = event;
    let _transaction = await transactions.findOne({
        transactionHash,
        transactionIndex,
        eventIndex,
    });
    if (!_transaction) {
        await new transactions({
            transactionHash,
            transactionIndex,
            eventIndex,
            vaultId: generatedVaultId,
            vaultUniqueId,
            timestamp,
            collateral: namePrefix.name,
            operation: MintPillar,
            amount,
        }).save();
    } else {
        logger.warn(`transactionHash-transactionHash-eventIndex already registered ${transactionHash}-${transactionIndex}-${eventIndex}`);
    }
};
module.exports = {
    processEvents,
};
