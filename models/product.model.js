const mongoose = require('mongoose');

const product = new mongoose.Schema({
    productName:{
        type: String,
    },
    price:{
        type: Number,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    stock:{
        type: Number,
    },
    productImage: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isFavorite: {
        type: Boolean,
        default: false
    }
},{timestamps: true, versionKey: false});

module.exports = mongoose.model('Product', product);