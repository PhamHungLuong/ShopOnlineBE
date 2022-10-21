const express = require('express');
const { check } = require('express-validator');

const authControllers = require('../controllers/authControllers');

const router = express.Router();

router.post(
    '/login',
    [
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 }),
    ],
    authControllers.login,
);

router.post(
    '/signup',
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 }),
    ],
    authControllers.signup,
);

module.exports = router;
