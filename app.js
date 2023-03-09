const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

mongoose.set('strictQuery', true);

mongoose.connect(
    'mongodb+srv://adminrestapi:' +
    process.env.MONGO_ATLAS_PW +
    '@node-rest-shop.rakib3f.mongodb.net/?retryWrites=true&w=majority'
);

app.use(morgan('dev'));

// Put the uploads folder to static for everyone to access
app.use('/uploads', express.static('uploads'));
// This will display the image when using the URL path as:
// 127.0.0.1:3000/uploads/ --<imagename>--

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// To prevent CORS error
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorizaation"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});

// Routes which should handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

// Handle the Errors
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


module.exports = app;
