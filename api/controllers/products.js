const Product = require("../models/product");
const mongoose = require('mongoose');

exports.products_get_all = (req, res, next) => {
    Product
        .find()
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        request: [
                            {
                                type: 'GET',
                                description: "Get product's info",
                                url: 'http://127.0.0.1:3000/products/' + doc._id
                            },
                            {
                                type: 'DELETE',
                                description: 'Delete this product',
                                url: 'http://127.0.0.1:3000/products/' + doc._id
                            }
                        ]
                    }
                })
            };
            res.status(200).json(response);

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.products_create_product = (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created product successfully!',
                createProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://127.0.0.1:3000/products/' + result._id
                    }

                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

exports.products_get_product = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        description: 'Get all products',
                        url: 'http://127.0.0.1:3000/products/'
                    }
                });
            } else {
                res.status(404).json({ message: 'No valid entry for provided ID' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.products_update_product = (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.findByIdAndUpdate({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product is updated',
                request: {
                    type: 'GET',
                    url: 'http://127.0.0.1:3000/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
}

exports.products_delete_product = (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product is deleted',
                request: {
                    type: 'GET',
                    description: 'Get all products',
                    url: 'http://127.0.0.1:3000/products/'
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}
