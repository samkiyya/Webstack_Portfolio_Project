const QualityGuideline = require('../models/qaulityModel');

// Create a new quality guideline for a genre
const createQualityGuideline = async (req, res) => {
  try {
    const { genre, guidelines } = req.body;

    // Check if a guideline for this genre already exists
    const existingGuideline = await QualityGuideline.findOne({
      where: { genre }
    });

    if (existingGuideline) {
      return res.status(400).json({ message: 'Quality guidelines for this genre already exist' });
    }

    // Create a new guideline
    const newGuideline = await QualityGuideline.create({ genre, guidelines });
    res.status(201).json(newGuideline);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all quality guidelines
const getAllQualityGuidelines = async (req, res) => {
  try {
    const guidelines = await QualityGuideline.findAll();
    res.status(200).json(guidelines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a quality guideline by genre
const getQualityGuidelineByGenre = async (req, res) => {
  try {
    const { genre } = req.params;

    const guideline = await QualityGuideline.findOne({
      where: { genre }
    });

    if (!guideline) {
      return res.status(404).json({ message: 'Quality guidelines for this genre not found' });
    }

    res.status(200).json(guideline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a quality guideline by genre
const updateQualityGuideline = async (req, res) => {
  try {
    const { genre } = req.params;
    const { guidelines } = req.body;

    const guideline = await QualityGuideline.findOne({
      where: { genre }
    });

    if (!guideline) {
      return res.status(404).json({ message: 'Quality guidelines for this genre not found' });
    }

    // Update the guideline
    guideline.guidelines = guidelines;
    await guideline.save();

    res.status(200).json(guideline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a quality guideline by genre
const deleteQualityGuideline = async (req, res) => {
  try {
    const { genre } = req.params;

    const guideline = await QualityGuideline.findOne({
      where: { genre }
    });

    if (!guideline) {
      return res.status(404).json({ message: 'Quality guidelines for this genre not found' });
    }

    // Delete the guideline
    await guideline.destroy();

    res.status(200).json({ message: 'Quality guidelines deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQualityGuideline,
  getAllQualityGuidelines,
  getQualityGuidelineByGenre,
  updateQualityGuideline,
  deleteQualityGuideline
};
