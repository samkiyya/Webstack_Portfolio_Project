const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middlewares/auth'); // Middleware for user authentication
const {
  createReview,
  updateReview,
  deleteReview,
  getBookReviews,
  getAverageRating,
} = require('../controllers/userReviewController');

// Routes
router.post('/', verifyUser, createReview); // Create a review
router.put('/:id', verifyUser, updateReview); // Update a review
router.delete('/:id', verifyUser, deleteReview); // Delete a review
router.get('/:bookId', getBookReviews); // Get reviews for a book
router.get('/average/:bookId', getAverageRating); // Get average rating for a book

module.exports = router;
