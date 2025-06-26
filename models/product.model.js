const mongoose = require('mongoose');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

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

product.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('Product', product);