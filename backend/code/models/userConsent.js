const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const { WarningConsent } = require('../constants');

const model = mongoose.model(
    'consent',
    new Schema({
        id: ObjectId,
        address: {
            type: String,
            index: true,
        },
        publicKey: {
            type: String,
            index: true,
        },
        message: {
            type: String,
            default: WarningConsent,
        },
        signature: {
            type: String,
        },
    })
);

module.exports = model;
