const express = require('express');
const { check } = require('express-validator');

const userControllers = require('../controllers/userControllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.post(
    '/:uid',
    fileUpload.single('image'),
    [check('name').isString(), check('password').isString()],
    userControllers.updateUser,
);

router.get('/:uid', userControllers.getUserById);

module.exports = router;
