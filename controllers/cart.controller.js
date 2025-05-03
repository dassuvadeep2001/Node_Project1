const productModel = require('../models/product.model');    

class cartController{
        async addToCart(req,res){
            try {
                const { productId } = req.body;
                if (!productId) {
                    return res.status(400).json({
                        status: 400,
                        message: "Please provide the details. It's a required field",
                        data: {}
                    });
                }
                const product = await productModel.findById(productId);
                if (!product) {
                    return res.status(404).json({
                        status: 404,
                        message: "Product not found",
                        data: {}
                    });
                }
               if (!req.session.cart) {
                req.session.cart = [];
               }
               const existingProduct = req.session.cart.findIndex(item => item.productId === productId);
               if (existingProduct > -1) {
                req.session.cart[existingProduct].quantity += 1;
               } else {
                req.session.cart.push({ 
                    productId: productId, 
                    quantity: 1,
                    productName: product.productName,
                    price: product.price,
                    productImage: product.productImage
                 });
               }
               return res.json({
                status: 200,
                message: "Product added to cart successfully",
                data: req.session.cart
               });
            } catch (error) {
                return res.json({
                    status: 500,
                    message: error.message,
                    data: {}
                });
            }
        }
        async viewCart(req, res) {
            try {
                const cart = req.session.cart || [];
                return res.json({
                    status: 200,
                    message: "Cart retrieved successfully",
                    data: cart
                });
            } catch (error) {
                return res.status(500).json({
                    status: 500,
                    message: error.message,
                    data: {}
                });
            }
        }
        async removeFromCart(req, res) {
            try {
                const { productId } = req.params;
        
                // Ensure the cart is initialized
                if (!req.session.cart) {
                    req.session.cart = [];
                }
        
                // Find the product in the cart
                const existingProduct = req.session.cart.findIndex(item => item.productId === productId);
        
                if (existingProduct > -1) {
                    // Remove the product from the cart
                    req.session.cart.splice(existingProduct, 1);
                    return res.json({
                        status: 200,
                        message: "Product removed from cart successfully",
                        data: req.session.cart
                    });
                } else {
                    return res.status(404).json({
                        status: 404,
                        message: "Product not found in cart",
                        data: {}
                    });
                }
            } catch (error) {
                return res.status(500).json({
                    status: 500,
                    message: error.message,
                    data: {}
                });
            }
        }
}

module.exports = new cartController();