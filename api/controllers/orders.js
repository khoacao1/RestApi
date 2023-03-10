const Order = require("../models/order");
const Product = require("../models/product");
const mongoose = require('mongoose');


exports.orders_get_all = (req, res, next) => {
    Order
        .find()
        .select('product quantity _id')
        .populate('product', 'name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            description: "Get order's info",
                            url: 'http://127.0.0.1:3000/orders/' + doc._id
                        }
                    }
                }),
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

exports.order_create_order = (req, res, next) => {
    Product.findById(req.body.productID)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'Product not found'
                })
            };
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productID
            });
            return order
                .save()
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Order stored',
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: 'http://127.0.0.1:3000/orders/' + result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate('product', 'name')
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: 'Order not found'
                })
            };
            res.status(200).json({
                order: order,
                request: [
                    {
                        type: 'GET',
                        description: 'Get all orders',
                        url: 'http://127.0.0.1:3000/orders/'
                    },
                    {
                        type: 'DELETE',
                        description: 'Delete this order',
                        url: 'http://127.0.0.1:3000/orders/' + order._id
                    }
                ]
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.orders_delete_order = (req, res, next) => {
    Order.remove({ _id: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Order is deleted',
                request: [
                    {
                        type: 'GET',
                        description: 'Get all Orders',
                        url: 'http://127.0.0.1:3000/orders/'
                    },
                    {
                        type: 'POST',
                        description: 'Create new Order',
                        url: 'http://127.0.0.1:3000/orders/',
                        body: {
                            productID: 'ID',
                            quantity: 'Number'
                        }
                    }
                ]
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

}
