const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Product = require('../models/product');
const Comment = require('../models/comment');
const Cart = require('../models/cart');

const getProducts = async (req, res, next) => {
    let products;

    try {
        products = await Product.find({});
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please, try again',
            500,
        );
        return next(error);
    }

    res.status(200).json({
        products: products.map((product) => {
            return product.toObject({ getters: true });
        }),
    });
};

const getProductById = async (req, res, next) => {
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
        const error = new HttpError('Could not find product for this Id', 404);
        return next(error);
    }

    res.status(200).json({ product: product.toObject({ getters: true }) });
};

const createProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Failed, please check your input.', 400));
    }

    const { name, description, price, size, creator } = req.body;

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Failed, try again please!', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user by this Id', 404);
        return next(error);
    }

    const productCreated = new Product({
        name,
        description,
        price,
        size,
        image: '',
        comment: [],
        creator: creator,
    });

    try {
        const ss = await mongoose.startSession();
        ss.startTransaction();
        await productCreated.save({ session: ss });
        user.products.push(productCreated);
        await user.save({ session: ss });
        await ss.commitTransaction();
    } catch (err) {
        const error = new HttpError('Creating failed, try again please',500);
        return next(error);
    }

    res.status(201).json({
        product: productCreated.toObject({ getters: true }),
    });
};

const updateProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, please check your data.', 400),
        );
    }

    const { name, description, price, size, creator } = req.body;
    const productId = req.params.pid;

    let product;
    let userCreator;

    try {
        product = await Product.findById(productId);
        userCreator = await User.findById(creator);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again!',
            500,
        );
        return next(error);
    }

    if (!product && !userCreator) {
        const error = new HttpError('Product or User does not exist', 400);
        return next(error);
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.size = size;

    try {
        await product.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, please try again',500);
        return next(error);
    }

    res.status(201).json({ product: product.toObject({ getters: true }) });
};

const deleteProduct = async (req, res, next) => {
    const productId = req.params.pid;

    let product;
    try {
        product = await Product.findById(productId)
            .populate('creator')
            .populate('comments');
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Something went wrong, please try again.',
            500,
        );
        return next(error);
    }

    if (!product) {
        const error = new HttpError(
            'Invalid ID, could not find matching product',
            400,
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
        const cartProducts = await Cart.find({ productId: product.id });
        cartProducts.map(async (cartProduct) => {
            return await cartProduct.remove({ session: ss });
        });
        product.creator.products.pull(product);
        await product.creator.save({ session: ss });
        await product.remove({ session: ss });
        await ss.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    res.status(200).json({ message: 'Deleted product' });
};

const searchProduct = async (req, res, next) => {
    try {
        const productQuery = await req.query.product;
        let productsSearch = [];

        const products = await Product.find({});

        if (products) {
            products.forEach((product) => {
                if (product.name.match(productQuery)) {
                    productsSearch.push(product);
                }
            });
        } else {
            res.status(200).json({ message: 'Could not find product' });
        }

        if (!!productsSearch) {
            res.status(200).json({
                products: productsSearch.map((productSearch) => {
                    if (productSearch) {
                        return productSearch.toObject({ getters: true });
                    }
                }),
            });
        } else {
            res.status(200).json({ message: 'Could not find product' });
        }
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again!',
            500,
        );
        return next(error);
    }
};

const getProductsByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let products;
    try {
        products = await Product.find({ creator: userId });
    } catch (err) {
        const error = new HttpError('Something went wrong', 500);
        return next(error);
    }

    if (!products) {
        const error = new HttpError('product does not exist', 400);
        return next(error);
    }

    res.status(200).json({
        products: products.map((product) => {
            return product.toObject({ getters: true });
        }),
    });
};

exports.getProducts = getProducts;
exports.getProductsByUserId = getProductsByUserId;
exports.getProductById = getProductById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.createProduct = createProduct;
exports.searchProduct = searchProduct;
