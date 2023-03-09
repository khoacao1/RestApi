const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.user_signup = (req, res, next) => {
    // Check if emailed is existed
    User
        .find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Email exists"
                }); // 409 for conflict
            } else {
                // Salting the password before hashing adds random string into it so the hashed data cannot be reversed with
                // some dictionary from google, etc...
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    messaage: 'User created'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });

            }
        });
}

exports.user_delete = (req, res, next) => {
    User.remove({ _id: req.params.userID })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User is deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}

exports.user_login = (req, res, next) => {
    User
        .find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Authentication failed.'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Authentication failed.'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        email: user[0].email,
                        userID: user[0]._id,
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        },);
                    return res.status(200).json({
                        message: 'Authentication successful.',
                        token: token,
                        request: [
                            {
                                type: 'DELETE',
                                description: 'Delete this User',
                                url: 'http://127.0.0.1:3000/user/' + user[0]._id
                            }
                        ]
                    });
                }
                res.status(401).json({
                    message: 'Authentication failed.'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

// This function is for testing and debugging only
exports.user_get_all = (req, res, next) => {
    User
        .find()
        .select('email password')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        email: doc.email,
                        password: doc.password,
                        _id: doc._id,
                        request: [
                            {
                                type: 'DELETE',
                                description: 'Delete this user',
                                url: 'http://127.0.0.1:3000/user/' + doc._id
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
