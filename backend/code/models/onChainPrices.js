const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const onChainPrices = mongoose.model(
    'onChainPrices',
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
                col: 0,
                price: 0,
                decimals: 0,
                blockNumber: 0,
            },
        },
    })
);

module.exports = onChainPrices;
