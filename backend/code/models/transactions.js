const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const TransactionSchema = new Schema({
    id: ObjectId,
    timestamp: {
        type: Number,
        index: true,
    },
    vaultUniqueId: {
        type: String,
        index: true,
        required: true,
    },
    vaultId: { type: String, index: true, required: true },
    collateral: {
        type: String,
        required: true,
        index: true,
    },
    amount: { type: Number, required: true },
    operation: { type: String, required: true, index: true },
    transactionHash: { type: String, required: true, index: true },
    transactionIndex: { type: Number, required: true, index: true },
    eventIndex: { type: Number, required: true, index: true },
    details: {
        type: Object,
    },
});

TransactionSchema.virtual('vault', {
    ref: 'vaults',
    localField: 'vaultUniqueId',
    foreignField: 'vaultUniqueId',
    justOne: true,
});

const transactions = mongoose.model('transactions', TransactionSchema);

module.exports = transactions;
