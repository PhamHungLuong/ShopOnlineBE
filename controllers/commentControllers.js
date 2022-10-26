const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Comment = require('../models/comment');
const User = require('../models/user');
const Product = require('../models/product');

const getCommentsByProductId = async (req, res, next) => {
    const productId = req.params.pid;

    let product;
    let comments;
    try {
        product = await Product.findById(productId);
        comments = await Comment.find({ ofProduct: productId }).populate(
            'creator',
        );
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    if (!product) {
        const error = new HttpError('product does not exist', 500);
        return next(error);
    }

    res.status(200).json({
        comments: comments.map((comment) => {
            return comment.toObject({ getters: true });
        }),
    });
};

const postComment = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Failed, please check your input.', 422));
    }

    const { content, creator, ofProduct } = req.body;

    let user;
    let product;
    try {
        user = await User.findById(creator);
        product = await Product.findById(ofProduct);
    } catch (err) {
        const error = new HttpError('Failed, please try again', 500);
        return next(error);
    }

    if (!user && !product) {
        const error = new HttpError(
            'Failed,Maybe User or Product existed',
            402,
        );
        return next(error);
    }

    const commentCreated = new Comment({
        content: content,
        creator: creator,
        ofProduct: ofProduct,
    });

    try {
        const ss = await mongoose.startSession();
        ss.startTransaction();
        await commentCreated.save({ session: ss });
        user.comments.push(commentCreated);
        await user.save({ session: ss });
        product.comments.push(commentCreated);
        await product.save({ session: ss });
        await ss.commitTransaction();
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Post comment failed, please try again',
            500,
        );
        return next(error);
    }
    let commentReturn;
    try {
        commentReturn = await commentCreated.populate('creator');
    } catch (err) {
        console.log(err);
    }

    res.status(200).json({
        comment: commentReturn.toObject({ getters: true }),
    });
};

const deleteComment = async (req, res, next) => {
    const productId = req.params.cid;

    let comment;
    try {
        comment = await Comment.findById(productId)
            .populate('creator')
            .populate('ofProduct');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again!',
            402,
        );
        return next(error);
    }

    if (!comment) {
        const error = new HttpError('Id comment invalid, try again!', 404);
        return next(error);
    }

    try {
        const ss = await mongoose.startSession();
        ss.startTransaction();
        comment.ofProduct.comments.pull(comment);
        await comment.ofProduct.save({ session: ss });
        comment.creator.comments.pull(comment);
        await comment.creator.save({ session: ss });
        await comment.remove({ session: ss });
        ss.commitTransaction();
    } catch (err) {
        const error = new HttpError('Deleting Failed, please try again', 402);
        return next(error);
    }

    res.status(200).json({ message: 'Deleted Comment Success!!' });
};

const updateComment = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Failed, please check your input.', 422));
    }

    const commentId = req.params.cid;
    const { content } = req.body;
    let comment;
    try {
        comment = await Comment.findById(commentId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    if (!comment) {
        const error = new HttpError(
            'Invalid Id comment, please try again',
            402,
        );
        return next(error);
    }

    comment.content = content;

    try {
        await comment.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, You cant update comment',
            402,
        );
        return next(error);
    }

    res.status(200).json({ comment: comment.toObject({ getters: true }) });
};

exports.getCommentsByProductId = getCommentsByProductId;
exports.postComment = postComment;
exports.deleteComment = deleteComment;
exports.updateComment = updateComment;
