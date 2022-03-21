const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const RewardSchema = new Schema({
    id: ObjectId,
    epoch: {
        type: String,
        index: true,
        required: true,
    },
    address: { type: String, indexed: true, required: true },
    amount: { type: Schema.Types.Number, required: true },
    claimed: { type: Schema.Types.Boolean, indexed: true, default: false },
});

RewardSchema.virtual('tokenDetails', {
    ref: 'rewardPerEpoch',
    localField: 'epoch',
    foreignField: 'epoch',
    justOne: true,
});

RewardSchema.set('toJSON', { virtuals: true });

const model = mongoose.model('userRewards', RewardSchema);

module.exports = model;
