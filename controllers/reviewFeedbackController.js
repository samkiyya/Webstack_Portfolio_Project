const ReviewFeedback = require('../models/ReviewFeedbackModel ');
const User = require('../models/Usermodel');
const Review = require('../models/ReviewModel');

// Create a new ReviewFeedback
exports.createReviewFeedback = async (req, res) => {
  try {
    const { answer, review_id } = req.body;
    const author_id = req.user.id;

    // Validate input
    if (!answer || !author_id || !review_id) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create feedback
    const feedback = await ReviewFeedback.create({
      answer,
      author_id,
      review_id,
    });

    res.status(201).json({ message: 'Review feedback created successfully.', feedback });
  } catch (error) {
    console.error('Error creating review feedback:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get all ReviewFeedback entries
exports.getAllReviewFeedbacks = async (req, res) => {
  try {
    const author_id = req.user.id;

    const feedbacks = await ReviewFeedback.findAll({
      where: { author_id },
      include: [
        { model: User, as: 'author', attributes: ['id', 'fname', 'email'] },
        { model: Review, as: 'review', attributes: ['id', 'comment', 'reviewRating'] },
      ],
    });

    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error('Error fetching review feedbacks:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get a single ReviewFeedback by ID
exports.getReviewFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const author_id = req.user.id;

    const feedback = await ReviewFeedback.findOne({
      where: { id, author_id },
      include: [
        { model: User, as: 'author', attributes: ['id', 'fname', 'email'] },
        { model: Review, as: 'review', attributes: ['id', 'comment', 'reviewRating'] },
      ],
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Review feedback not found.' });
    }

    res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error fetching review feedback:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update a ReviewFeedback by ID
exports.updateReviewFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const author_id = req.user.id;
    const { answer } = req.body;

    const feedback = await ReviewFeedback.findOne({ where: { id, author_id } });

    if (!feedback) {
      return res.status(404).json({ message: 'Review feedback not found.' });
    }

    feedback.answer = answer || feedback.answer;
    await feedback.save();

    res.status(200).json({ message: 'Review feedback updated successfully.', feedback });
  } catch (error) {
    console.error('Error updating review feedback:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete a ReviewFeedback by ID
exports.deleteReviewFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const author_id = req.user.id;

    const feedback = await ReviewFeedback.findOne({ where: { id, author_id } });

    if (!feedback) {
      return res.status(404).json({ message: 'Review feedback not found.' });
    }

    await feedback.destroy();

    res.status(200).json({ message: 'Review feedback deleted successfully.' });
  } catch (error) {
    console.error('Error deleting review feedback:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
