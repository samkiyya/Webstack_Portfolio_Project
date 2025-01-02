const express = require('express');
const router = express.Router();
const {
  createQualityGuideline,
  getAllQualityGuidelines,
  getQualityGuidelineByGenre,
  updateQualityGuideline,
  deleteQualityGuideline
} = require('../controllers/qaulityController');

// Create a new quality guideline
router.post('/', createQualityGuideline);

// Get all quality guidelines
router.get('/', getAllQualityGuidelines);

// Get a quality guideline by genre
router.get('/:genre', getQualityGuidelineByGenre);

// Update a quality guideline by genre
router.put('/:genre', updateQualityGuideline);

// Delete a quality guideline by genre
router.delete('/:genre', deleteQualityGuideline);

module.exports = router;
