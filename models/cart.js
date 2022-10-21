const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const cartSchema = new Schema({
    amount: { type: Number, require: true },
    isPayment: { type: Boolean, require: true },
    productId: { type: mongoose.Types.ObjectId, required: true, ref: 'Product' },
    owner: { type: mongoose.Types.ObjectId, require: true, ref: 'User' },
});

cartSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Cart', cartSchema);
