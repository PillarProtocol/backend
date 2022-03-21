const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const model = mongoose.model(
    'prices',
    new Schema({
        id: ObjectId,
        collateral: {
            type: String,
            index: true,
        },
        source: {
            type: String,
            index: true,
        },
        symbol: {
            type: String,
            index: true,
            unique: true,
            required: true,
        },
        value: { type: Schema.Types.Decimal128, default: 0 },
        updatedAt: { type: Schema.Types.Number, default: 0 },
    })
);

module.exports = model;
