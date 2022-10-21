const express = require('express');

const adminControllers = require('../controllers/adminControllers');

const router = express.Router();

router.get('/', adminControllers.getUser);

router.delete('/user/:uid', adminControllers.deleteUser);

router.delete('/product/:pid', adminControllers.deleteProduct);

module.exports = router;
