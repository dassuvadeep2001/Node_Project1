const mongoose = require('mongoose');

const review = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    rating: {
        type: Number,
    },
    review: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},{timestamps: true, versionKey: false});

module.exports = mongoose.model('Review', review);