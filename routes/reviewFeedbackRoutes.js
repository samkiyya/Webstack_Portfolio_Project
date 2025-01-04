const express = require('express');
const router = express.Router();
const{verifyUser}=require("../middlewares/auth");
const {
  createReviewFeedback,
  getAllReviewFeedbacks,
  getReviewFeedbackById,
  updateReviewFeedback,
  deleteReviewFeedback,
 
} = require('../controllers/reviewFeedbackController');

// Define routes
router.post('/', verifyUser,createReviewFeedback); // Create new feedback
router.get('/:id', verifyUser,getAllReviewFeedbacks); // Get all feedbacks
router.get('/:id',verifyUser, getReviewFeedbackById); // Get feedback by ID
router.put('/:id',verifyUser, updateReviewFeedback); // Update feedback by ID
router.delete('/:id', verifyUser,deleteReviewFeedback); // Delete feedback by ID

module.exports = router;
