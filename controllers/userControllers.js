const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const updateUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, please check your data.', 422),
        );
    }

    const userId = req.params.uid;
    const { name, password } = req.body;

    let user;

    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError('User does not exist', 400);
        return next(error);
    }

    console.log(req.file.path);

    user.name = name;
    user.password = password;
    user.image = req.file.path;

    try {
        await user.save();
    } catch (err) {
        console.log(err);
        const error = new HttpError('Something went wrong, please try again');
        return next(error);
    }

    res.status(200).json({ message: 'Success' });
};

const getUserById = async (req, res, next) => {
    const userId = req.params.uid;

    let userExisting;
    try {
        userExisting = await User.findById(userId);
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Something went wrong, please try again',
            500,
        );
        return next(error);
    }

    if (!userExisting) {
        const error = new HttpError('Failed, User existed', 402);
        return next(error);
    }

    res.status(200).json({ user: userExisting.toObject({ getters: true }) });
};

exports.updateUser = updateUser;
exports.getUserById = getUserById;
