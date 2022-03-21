const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const model = mongoose.model(
    'staking',
    new Schema({
        id: ObjectId,
        user: {
            type: String,
            index: true,
            unique: true,
        },
        shares: { type: Schema.Types.Number, default: 0 },
    })
);

module.exports = model;
