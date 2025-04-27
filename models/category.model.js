const mongoose = require('mongoose');

const category = new mongoose.Schema({
    categoryName:{
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},{timestamps: true, versionKey: false});

module.exports = mongoose.model('Category', category);