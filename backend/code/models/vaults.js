const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const vaults = mongoose.model(
    'vaults',
    new Schema({
        id: ObjectId,
        vaultUniqueId: {
            type: String,
            index: true,
            required: true,
            unique: true,
        },
        vaultId: {
            type: String,
            index: true,
            required: true,
        },
        owner: {
            type: String,
            index: true,
            required: true,
        },
        collateral: {
            type: String,
            required: true,
            index: true,
        },
        collateralAmount: {
            type: Number,
            default: 0,
        },
        pillarBorrowed: {
            type: Number,
            default: 0,
        },
        interestAccumulated: {
            type: Number,
            default: 0,
        },
        updatedAt: {
            type: Number,
            required: true,
            index: true,
        },
        createdAt: {
            type: Number,
            index: true,
            required: true,
        },
    })
);

module.exports = vaults;
