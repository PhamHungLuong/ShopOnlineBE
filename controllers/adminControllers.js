const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');

const User = require('../models/user');
const Product = require('../models/product');
const Comment = require('../models/comment');
const Cart = require('../models/cart');

const getUser = async (req, res, next) => {
    let users;
    try {
        users = await User.find(
            {
                isAdmin: { $in: [false] },
            },
            '-password',
        );
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500,
        );
        return next(error);
    }

    res.json({
        users: users.map((user) => {
            return user.toObject({ getters: true });
        }),
    });
};

const deleteUser = async (req, res, next) => {
    const userId = req.params.uid;

    let user;
    try {
        user = await User.findById(userId).populate('products');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    try {
        const ss = await mongoose.startSession();
        ss.startTransaction();
        if (!user.products) {
            const products = await Product.find({ creator: userId });
            products.map(async (product) => {
                return await product.remove({ session: ss });
            });
        }
        if (!user.comments) {
            const comments = await Comment.find({ creator: userId });
            comments.map(async (comment) => {
                return await comment.remove({ session: ss });
            });
        }
        if (!user.cart) {
            const cartProducts = await Cart.find({ owner: userId });
            cartProducts.map(async (cartProduct) => {
                return await cartProduct.remove({ session: ss });
            });
        }
        await user.remove({ session: ss });
        await ss.commitTransaction();
    } catch (err) {
        console.log(err);
        const error = new HttpError('Cant delete user, please try again', 500);
        return next(error);
    }

    res.status(201).json({ message: 'Deleted User' });
};

const deleteProduct = async (req, res, next) => {
    const productId = req.params.pid;

    let product;
    try {
        product = await Product.findById(productId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    if (!product) {
        const error = new HttpError(
            'Cant not find product by this Id, please try again',
            402,
        );
        return next(error);
    }

    try {
        const ss = await mongoose.startSession();
        ss.startTransaction();
        if (!product.comments) {
            const comments = await Comment.find({ ofProduct: productId });
            comments.map(async (comment) => {
                return await comment.remove({ session: ss });
            });
        }
        if (!product.creator.cart) {
            const cartProducts = await Cart.find({ productId: productId });
            cartProducts.map(async (cartProduct) => {
                return await cartProduct.remove({ session: ss });
            });
        }
        await product.remove({ session: ss });
        product.creator.products.pull(product);
        await product.creator.save({ session: ss });
        await ss.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    res.status(200).json({ message: 'Delete Success' });
};

exports.getUser = getUser;
exports.deleteUser = deleteUser;
exports.deleteProduct = deleteProduct;
