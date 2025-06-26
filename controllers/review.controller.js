const express = require('express');
const reviewModel = require('../models/review.model');

class ReviewController{
    async createReview(req, res) {
        try {
            const { productId, rating, review, userId} = req.body;
            if (!productId || !rating || !userId || !review) {
                return res.status(400).json({
                    status: 400,
                    message: "Please provide all required fields: productId, rating, review, and userId.",
                    data: {}
                });
            }
            const result = await reviewModel.create({ productId, rating, review, userId });
            return res.json({
                status: 200,
                message: "Review created successfully",
                data: result
            });
        } catch (error) {
            return res.json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
}

module.exports = new ReviewController();