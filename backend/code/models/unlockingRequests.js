const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const model = mongoose.model(
    'unlockingRequests',
    new Schema({
        id: ObjectId,
        user: {
            type: String,
            index: true,
        },
        requestId: {
            type: String,
            index: true,
            unique: true,
        },
        block: { type: Schema.Types.Number, default: 0 },
        shares: { type: Schema.Types.Number, default: 0 },
        status: { type: String, default: 'Created', index: true }, //Created, Unlocked, Cancelled
    })
);

module.exports = model;
