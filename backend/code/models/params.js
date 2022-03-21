const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const model = mongoose.model(
    'params',
    new Schema({
        id: ObjectId,
        param: {
            type: String,
            index: true,
            unique: true,
        },
        value: { type: Schema.Types.Number, default: 0 },
    })
);

module.exports = model;
