const fs = require('fs');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userCartRoutes = require('./routes/userCartRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// analysis data
app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

// turn off CORS
app.use('*', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS',
    );

    next();
});

// api routes
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/product', productRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/cart', userCartRoutes);
app.use('/api/user', userRoutes);

// error
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

// res message error
app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred' });
});

mongoose
    .connect(
        `mongodb+srv://phamluong:luong2002@cluster0.8eulzn8.mongodb.net/ShopOnline?retryWrites=true&w=majority`,
    )
    .then(() => {
        app.listen(5000);
    })
    .catch((err) => {
        console.log(err);
    });
