const productModel= require('../models/product.model'); 
const reviewModel = require('../models/review.model');
const Mailer = require('../helper/mailer');

class ProductController {
    async createProduct(req, res) {
        try {
            const {productName, price, categoryId, stock} = req.body;
            if(!productName || !price || !categoryId || !stock){
                return res.status(400).json({
                    status: 400,
                    message: "Please provide the details. Its a required field",
                    data: {}
                });
            }
            let productImage = "";
            if(req.file){
                productImage = req.file.filename;
            }
            req.body.productImage = productImage;
            let product = await productModel.create({productName, price, categoryId, stock, productImage});
            return res.json({
                status: 200,
                message: "Product created successfully",
                data: product
            });
        } catch (error) {
            return res.json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
    async getProducts(req, res) {
    try {
        let options={page : 1, limit : 3};
        let products = productModel.aggregate([
            {
                $match: { isDeleted: false }
            },
            {
                $lookup: {
                    from: "reviews", // collection name in MongoDB
                    localField: "_id",
                    foreignField: "productId",
                    as: "reviews"
                }
            },
            {
                $addFields: {
                    averageReview: { $avg: "$reviews.rating" },
                }   
            },
            {
                $project: {
                    productName: 1,
                    price: 1,
                    categoryId: 1,
                    stock: 1,
                    productImage: 1,
                    averageReview: 1
                }
            },     
        ])
        let pageProduct = await productModel.aggregatePaginate(products, options);
        return res.json({
            status: 200,
            message: "Products found successfully",
            total: pageProduct.total,
            page: pageProduct.page,
            data: pageProduct.docs,
            limit: pageProduct.limit,
            pages: pageProduct.pages
        });
    } catch (error) {
        return res.json({
            status: 500,
            message: error.message,
            data: {}
        });
    }
}
    async updateProduct(req, res) {
        try {
            const { productName, price, categoryId, stock } = req.body;
            const { id } = req.params; 
    
            if (!id) {
                return res.status(400).json({
                    status: 400,
                    message: "Product ID is required",
                    data: {}
                });
            }
    
            if (!productName || !price || !categoryId || !stock) {
                return res.status(400).json({
                    status: 400,
                    message: "Please provide the details. It's a required field",
                    data: {}
                });
            }
    
            let productImage = "";
            if (req.file) {
                productImage = req.file.filename;
            }
    
            const updatedProduct = await productModel.updateOne(
                { _id: id },
                { $set: { productName, price, categoryId, stock, productImage } }
            );
            return res.json({
                status: 200,
                message: "Product updated successfully",
                data: updatedProduct
            });
        } catch (error) {
            return res.json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
    
            if (!id) {
                return res.status(400).json({
                    status: 400,
                    message: "Product ID is required",
                    data: {}
                });
            }
    
            const deletedProduct = await productModel.updateOne(
                { _id: id },
                { $set: { isDeleted: true } }
            );
            return res.json({
                status: 200,
                message: "Product deleted successfully",
                data: deletedProduct
            });
        } catch (error) {
            return res.json({    
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
    async getProductBasedOnStock(req, res) {
        try {
            let products = await productModel.find({ stock: { $lt: 1 }, isDeleted: false }).select("-createdAt -updatedAt -__v -isDeleted -_id -isFavorite");
            return res.json({
                status: 200,
                message: "Products found successfully, which is out of stock",
                data: products
            });
        } catch (error) {
            return res.json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
    async favoriteProduct(req, res) {
        try {
            const { id } = req.params; 
    
            if (!id) {
                return res.status(400).json({
                    status: 400,
                    message: "Product ID is required",
                    data: {}
                });
            }
            const product = await productModel.findById(id);
    
            if (!product) {
                return res.status(404).json({
                    status: 404,
                    message: "Product not found",
                    data: {}
                });
            }
    
            const updatedProduct = await productModel.updateOne(
                { _id: id },
                { $set: { isFavorite: !product.isFavorite } } // Toggle the value
            );
    
            return res.json({
                status: 200,
                message: `Product isFavorite updated to ${!product.isFavorite}`,
                data: updatedProduct
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
    async viewFavoriteProducts(req, res) {
        try {
            let products = await productModel.find({ isFavorite: true, isDeleted: false }).select("-createdAt -updatedAt -__v -isDeleted -_id -isFavorite");
            return res.json({
                status: 200,
                message: "Favorite products found successfully",
                data: products
            });
        } catch (error) {
            return res.json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }

    // async sendProductsDetailsInEmail(req, res) {
    //     try {
    //         const { email } = req.body;
    
    //         if (!email) {
    //             return res.status(400).json({
    //                 status: 400,
    //                 message: "Email is required",
    //                 data: {}
    //             });
    //         }
    
    //         const products = await productModel.find({ isDeleted: false }).select("productName price stock productImage");
    
    //         if (products.length === 0) {
    //             return res.status(404).json({
    //                 status: 404,
    //                 message: "No products found",
    //                 data: {}
    //             });
    //         }
    
    //         // Create plain-text version of the product details
    //         const plainTextDetails = products.map(product => 
    //             `Product Name: ${product.productName}, Price: ${product.price}, Stock: ${product.stock}`
    //         ).join('\n');
    
    //         // Send the email
    //         const mailer = new Mailer('Gmail', process.env.APP_EMAIL, process.env.APP_PASSWORD);
    //         const mailObject = {
    //             to: email,
    //             subject: "Product Details",
    //             text: `Dear Customer,\n\nPlease find the details of the products below:\n\n${plainTextDetails}` 
    //         };
    
    //         await mailer.sendMail(mailObject); 

    //         return res.json({
    //             status: 200,
    //             message: "Product details sent successfully",
    //         });
    //     } catch (error) {
    //         return res.json({
    //             status: 500,
    //             message: error.message,
    //         });
    //     }
    // }
}

module.exports = new ProductController();