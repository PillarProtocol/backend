const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const rewardPerEpoch = mongoose.model(
    'rewardPerEpoch',
    new Schema({
        id: ObjectId,
        epoch: {
            type: String,
            index: true,
            unique: true,
            required: true,
        },
        value: { type: Schema.Types.Number, default: 0 },
        token: { type: String, indexed: true, default: 'to be updated' },
    })
);

module.exports = rewardPerEpoch;
