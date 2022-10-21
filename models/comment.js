const mongoose = require('mongoose');

const schema = mongoose.Schema;

const commentSchema = new schema({
    content: { type: String, require: true },
    ofProduct: { type: mongoose.Types.ObjectId, require: true, ref: 'Product' },
    creator: { type: mongoose.Types.ObjectId, require: true, ref: 'User' },
});

module.exports = mongoose.model('Comment', commentSchema);
