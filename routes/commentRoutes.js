const express = require('express');
const { check } = require('express-validator');

const commentControllers = require('../controllers/commentControllers');

const router = express.Router();

router.get('/product/:pid', commentControllers.getCommentsByProductId);

router.post(
    '/',
    [check('content').not().isEmpty()],
    commentControllers.postComment,
);

router.delete('/:cid', commentControllers.deleteComment);

router.patch(
    '/:cid',
    [check('content').not().isEmpty()],
    commentControllers.updateComment,
);

module.exports = router;
