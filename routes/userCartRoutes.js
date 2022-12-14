const express = require('express');
const { check } = require('express-validator');

const userCartControllers = require('../controllers/userCartControllers');

const router = express.Router();

router.get('/:uid', userCartControllers.getListCartByUserId);

router.post(
    '/add',
    [check('amount').isNumeric()],
    userCartControllers.addProductToCart,
);

router.patch(
    '/:cid',
    [check('amount').isNumeric()],
    userCartControllers.updateCartProduct,
);

router.patch('/payment/:cid', userCartControllers.payment);

router.delete('/:cid', userCartControllers.deleteCart);

module.exports = router;
