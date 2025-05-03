const router = require('express').Router();
const cartController = require('../controllers/cart.controller');
const auth= require('../middleware/auth')();

router.post('/addToCart', auth.authenticate, cartController.addToCart);
router.get('/viewCart', auth.authenticate, cartController.viewCart);
router.delete('/removeFromCart/:productId', auth.authenticate, cartController.removeFromCart);

module.exports = router;
