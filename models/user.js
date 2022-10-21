const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true, minlength: 6 },
    image: { type: String },
    isAdmin: { type: Boolean },
    products: [
        { type: mongoose.Types.ObjectId, required: true, ref: 'Product' },
    ],
    comments: [
        { type: mongoose.Types.ObjectId, require: true, ref: 'Comment' },
    ],
    cart: [{ type: mongoose.Types.ObjectId, require: true, ref: 'Cart' }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
