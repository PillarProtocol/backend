const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const collectives = mongoose.model(
    'collectives',
    new Schema({
        id: ObjectId,
        collateral: {
            type: String,
            index: true,
            unique: true,
        },
        value: {
            type: Object,
            default: {
                totalPillarMinted: 0,
                totalPillarRepaid: 0,
                totalCollateral: 0,
            },
        },
    })
);

module.exports = collectives;
