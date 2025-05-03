const router = require('express').Router();
const productController = require('../controllers/product.controller');
const auth= require('../middleware/auth')()
const multer = require("../helper/fileUpload");
const fileUpload = new multer({ folderName: "uploads", supportedFiles: ["image/png", "image/jpg", "image/jpeg"], maxSize: 5 * 1024 * 1024 });

router.post('/createProduct',auth.adminAuthenticate, fileUpload.upload().single('productImage'), productController.createProduct);
router.get('/getProducts', productController.getProducts);
router.put('/updateProduct/:id',auth.adminAuthenticate, fileUpload.upload().single('productImage'), productController.updateProduct);
router.delete('/deleteProduct/:id',auth.adminAuthenticate, productController.deleteProduct);
router.get('/getProductBasedOnStock', productController.getProductBasedOnStock);
router.put('/favoriteProduct/:id',auth.authenticate, productController.favoriteProduct);
router.get('/viewFavoriteProducts',auth.authenticate, productController.viewFavoriteProducts);
// router.post('/sendProductsDetailsInEmail',auth.adminAuthenticate, productController.sendProductsDetailsInEmail);

module.exports = router;