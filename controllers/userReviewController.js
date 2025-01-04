const UserReview = require('../models/userReview');
const User = require('../models/Usermodel'); // Assuming User model exists
const Book = require('../models/BookModel'); // Assuming Book model exists

// Create a review
const createReview = async (req, res) => {
  try {
    const { bookId, comment, reviewRating } = req.body;
    const userId = req.user.id; // Assuming user authentication middleware sets req.user

    const review = await UserReview.create({
      userId,
      bookId,
      comment,
      reviewRating,
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
    try {
      const userId = req.user.id; // Authenticated user's ID
      const { id } = req.params; // Review ID from URL parameters
      const { comment, reviewRating } = req.body;
  
      // Find the review by ID and ensure it belongs to the authenticated user
      const review = await UserReview.findOne({ where: { id, userId } });
  
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found or not authorized' });
      }
  
      // Update the review
      await review.update({ comment, reviewRating });
  
      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  // Delete a review
  const deleteReview = async (req, res) => {
    try {
      const userId =req.user.id; // Authenticated user's ID
      const { id } = req.params; // Review ID from URL parameters
  
      // Find the review by ID and ensure it belongs to the authenticated user
      const review = await UserReview.findOne({ where: { id, userId } });
  
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found or not authorized' });
      }
  
      // Delete the review
      await review.destroy();
  
      res.status(204).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

// Get reviews for a specific book
const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await UserReview.findAll({
      where: { bookId },
      include: [{ model: User, attributes: ['id', 'fname'] }], // Include user details
    });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Calculate average rating for a book
const getAverageRating = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await UserReview.findAll({
      where: { bookId },
      attributes: ['reviewRating'],
    });

    const averageRating =
      reviews.reduce((sum, review) => sum + review.reviewRating, 0) / reviews.length || 0;

    res.status(200).json({
      success: true,
      averageRating,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getBookReviews,
  getAverageRating,
};
