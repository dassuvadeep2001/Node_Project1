const router= require('express').Router();
const authController = require('../controllers/auth.controller');
const auth= require('../middleware/auth')()
const multer = require("../helper/fileUpload");
const fileUpload = new multer({ folderName: "uploads", supportedFiles: ["image/png", "image/jpg", "image/jpeg"], maxSize: 5 * 1024 * 1024 });

router.post('/register', fileUpload.upload().single('profileImage'), authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password/:id', authController.resetPassword);
router.get('/profile', auth.authenticate, authController.profile);
router.put('/update-profile', auth.authenticate, fileUpload.upload().single('profileImage'), authController.updateProfile);

module.exports = router;