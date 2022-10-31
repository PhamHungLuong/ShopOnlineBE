const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const Cart = require('../models/cart');
const User = require('../models/user');
const Product = require('../models/product');

const getListCartByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let userExisting;
    try {
        userExisting = User.findById(userId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again!',
            500,
        );
        return next(error);
    }

    if (!userExisting) {
        const error = new HttpError('Failed, User existed', 400);
        return next(error);
    }

    let cartProducts;
    try {
        cartProducts = await Cart.find({ owner: userId }).populate('productId');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    res.status(200).json({
        cartProducts: cartProducts.map((cartProduct) => {
            return cartProduct.toObject({ getters: true });
        }),
    });
};

const addProductToCart = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Failed, please check your input.', 400));
    }

    const { amount, productId, owner } = req.body;

    let user;
    let product;

    try {
        user = await User.findById(owner);
        product = await Product.findById(productId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    if (!user && !product) {
        const error = new HttpError('User or Product does not exist ', 400);
        return next(error);
    }

    if (amount === 0) {
        const error = new HttpError('Invalid Amount Product', 400);
        return next(error);
    }

    const cartCreated = new Cart({
        amount: amount,
        isPayment: false,
        productId: productId,
        owner: owner,
    });

    try {
        const ss = await mongoose.startSession();
        ss.startTransaction();
        await cartCreated.save({ session: ss });
        user.cart.push(cartCreated);
        await user.save({ session: ss });
        await ss.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Could not add to your cart, please try again',
            500,
        );
        return next(error);
    }

    let cartReturn;
    try {
        cartReturn = await cartCreated.populate('productId');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    res.status(201).json({ product: cartReturn.toObject({ getters: true }) });
};

const updateCartProduct = async (req, res, next) => {
    const cartId = req.params.cid;

    let cartProduct;
    try {
        cartProduct = await Cart.findById(cartId);
    } catch (err) {
        const error = new HttpError('Something went wrong', 500);
        return next(error);
    }

    if (!cartProduct) {
        const error = new HttpError(
            'Cart Product does not exist, please try again',
            500,
        );
        return next(error);
    }

    const { amount } = req.body;

    cartProduct.amount = amount;

    try {
        await cartProduct.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    res.status(201).json({
        cartProduct: cartProduct.toObject({ getters: true }),
    });
};

const payment = async (req, res, next) => {
    const cartId = req.params.cid;
    let cartProduct;
    try {
        cartProduct = await Cart.findById(cartId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    if (!cartProduct) {
        const error = new HttpError(
            'Cart of product does not exist, please try again',400
        );
        return next(error);
    }

    cartProduct.isPayment = true;

    try {
        cartProduct.save();
    } catch (err) {
        const error = new HttpError('Could not pay, please try again', 500);
        return next(error);
    }

    res.status(200).json({
        cartProduct: cartProduct.toObject({ getters: true }),
    });
};

const deleteCart = async (req, res, next) => {
    const cartId = req.params.cid;

    let cart;
    try {
        cart = await Cart.findById(cartId).populate('owner');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    if (!cart) {
        const error = new HttpError(
            'Invalid ID, could not find matching product',
            400,
        );
        return next(error);
    }

    try {
        const ss = await mongoose.startSession();
        ss.startTransaction();
        cart.owner.cart.pull(cart);
        await cart.owner.save({ session: ss });
        await cart.remove({ session: ss });
        await ss.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong', 500);
        return next(error);
    }

    res.status(200).json({ message: 'delete Success' });
};

exports.getListCartByUserId = getListCartByUserId;
exports.deleteCart = deleteCart;
exports.addProductToCart = addProductToCart;
exports.updateCartProduct = updateCartProduct;
exports.payment = payment;
