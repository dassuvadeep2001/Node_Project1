const categoryModel = require('../models/category.model');
const productModel = require('../models/product.model');
class CategoryController {
    async createCategory(req, res) {
        try {
            let { categoryName } = req.body;
            if (!categoryName) {
                return res.status(400).json({
                    status: 400,
                    message: "Please provide the Category name. Its a required field"
                });
            }
            let exist = await categoryModel.findOne({ categoryName });
            if (exist) {
                return res.json({
                    message: "Category Already Exist",
                    status: 400,
                    data: {}
                })
            }
            let category = await categoryModel.create({ categoryName });
            return res.json({
                status: 200,
                message: "Category created successfully",
                data: category
            });
        } catch (error) {
            return res.json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
    async getAllCategories(req, res) {
        try{
            const categories = await categoryModel.aggregate([
                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "categoryId",
                        as: "products" 
                    }
                },
                {
                    $match: {
                        isDeleted: false
                    }
                },
                {
                    $project: {
                        categoryName: 1,
                        totalProducts: { $size: "$products" },
                        products: {
                            $map: {
                                input: "$products",
                                as: "product",
                                in: {
                                    productName: "$$product.productName",
                                    price: "$$product.price",
                                    stock: "$$product.stock",
                                    productImage: "$$product.productImage"
                                }
                            }
                        }
                    }
                }
            ]);
           return res.json({
               status: 200,
               message: "Categories found successfully",
               data: categories
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

module.exports = new CategoryController();