const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const model = mongoose.model(
    'totalDelegations',
    new Schema({
        id: ObjectId,
        user: {
            type: String,
            index: true,
            unique: true,
        },
        stake: { type: Schema.Types.Number, default: 0, index: true },
    })
);

module.exports = model;
