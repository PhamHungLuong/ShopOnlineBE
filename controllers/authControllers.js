const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError(
                'Invalid inputs passed, please check your data.',
                422,
            ),
        );
    }

    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Could not login, pleaser try again.', 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError('No valid email address found.', 403);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = existingUser.password === password ? true : false;
    } catch (err) {
        const error = new HttpError('Could not login, please try again', 403);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError('wrong password ', 500);
        return next(error);
    }

    res.json({ email: existingUser.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError(
                'Invalid inputs passed, please check your data.',
                422,
            ),
        );
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again',
            422,
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'Account already exists, please check your email ',
            422,
        );
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password,
        image: '',
        isAdmin: false,
        cart: [],
        products: [],
    });

    try {
        await createdUser.save();
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Could not create user, please try again later.',
            500,
        );
        return next(error);
    }

    res.status(201).json({
        userId: createdUser.id,
        isAdmin: createdUser.isAdmin,
        name: createdUser.name,
    });
};

exports.login = login;
exports.signup = signup;

// send email
// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: 'OAuth2',
//         user: 'phamluong08062002@gmail.com',
//         pass: 'luong2002',
//         clientId:
//             '147634742631-bqcjpdm4f65nb70p8en6u88b3ihbs779.apps.googleusercontent.com',
//         clientSecret: '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',
//         refreshToken:
//             'ya29.a0Aa4xrXOfjqToFfalEVqpLY2261JaEFNsHeHDUkmLB7-sQ5LAIFwmRMhjg0cEh1Jp2yNQn6-DbUNsOLhYMb4Q1kaOWmxViSpVrDKDWthlbOqZO0vIYlk2t0N7ryzQQxIeiims5IEDdMGz2FgtB73Fa5ShQMiSaCgYKATASARMSFQEjDvL9Tu9JtlwQLit50h9xH3tl5g0163',
//     },
// });

// try {
//     await transporter.sendMail({
//         from: 'Shoppe Pha Ke',
//         to: 'phamluong08062002@gmail.com',
//         subject: 'Test send email ✔',
//         text: 'Hello world?',
//         html: '<b>dit me qUaN bUoI</b>',
//     });
// } catch (err) {
//     console.log(err);
//     const error = new HttpError('Could not send email.', 500);
//     return next(error);
// }