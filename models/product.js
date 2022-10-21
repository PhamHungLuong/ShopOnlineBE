const mongoose = require('mongoose');

const schema = mongoose.Schema;

const productSchema = new schema({
    name: { type: String, require: true },
    description: { type: String, require: true },
    price: { type: Number, require: true },
    size: { type: String, require: true },
    image: { type: String, required: true },
    creator: { type: mongoose.Types.ObjectId, require: true, ref: 'User' },
    comments: [
        { type: mongoose.Types.ObjectId, require: true, ref: 'Comment' },
    ],
});

module.exports = mongoose.model('Product', productSchema);
