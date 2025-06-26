const router = require('express').Router();
const reviewController = require('../controllers/review.controller');

router.post('/createReview', reviewController.createReview);

module.exports = router;