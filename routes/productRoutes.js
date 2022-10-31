const express = require('express');

const { check } = require('express-validator');
const productControllers = require('../controllers/productControllers');

const router = express.Router();

router.get('/search', productControllers.searchProduct);

router.get('/:pid', productControllers.getProductById);

router.get('/', productControllers.getProducts);

router.get('/user/:uid', productControllers.getProductsByUserId);

router.post(
    '/',
    [
        check('name').not().isEmpty(),
        check('description').not().isEmpty(),
        check('price').not().isEmpty(),
        check('size').not().isEmpty(),
    ],
    productControllers.createProduct,
);

router.patch(
    '/:pid',
    [
        check('name').not().isEmpty(),
        check('description').not().isEmpty(),
        check('price').not().isEmpty(),
        check('size').not().isEmpty(),
    ],
    productControllers.updateProduct,
);

router.delete('/:pid', productControllers.deleteProduct);

module.exports = router;
