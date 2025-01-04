const SubscriptionTier = require('../models/subscriptionTriesModel');

// Create a Subscription Tier
exports.createSubscriptionTier = async (req, res) => {
  try {
    const { tier_name, monthly_price, annual_price, content_type, benefit_limit, is_active } = req.body;

    const subscriptionTier = await SubscriptionTier.create({
      tier_name,
      monthly_price,
      annual_price,
      content_type,
      benefit_limit,
      is_active,
    });

    res.status(201).json({ message: 'Subscription tier created successfully', data: subscriptionTier });
  } catch (error) {
    res.status(500).json({ message: 'Error creating subscription tier', error: error.message });
  }
};

// Get All Subscription Tiers
exports.getAllSubscriptionTiers = async (req, res) => {
  try {
    const tiers = await SubscriptionTier.findAll();
    res.status(200).json({ message: 'Subscription tiers fetched successfully', data: tiers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription tiers', error: error.message });
  }
};

// Get Subscription Tier by ID
exports.getSubscriptionTierById = async (req, res) => {
  try {
    const { id } = req.params;
    const tier = await SubscriptionTier.findByPk(id);

    if (!tier) {
      return res.status(404).json({ message: 'Subscription tier not found' });
    }

    res.status(200).json({ message: 'Subscription tier fetched successfully', data: tier });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription tier', error: error.message });
  }
};

// Update a Subscription Tier
exports.updateSubscriptionTier = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const tier = await SubscriptionTier.findByPk(id);
    if (!tier) {
      return res.status(404).json({ message: 'Subscription tier not found' });
    }

    await tier.update(updates);
    res.status(200).json({ message: 'Subscription tier updated successfully', data: tier });
  } catch (error) {
    res.status(500).json({ message: 'Error updating subscription tier', error: error.message });
  }
};

// Delete a Subscription Tier
exports.deleteSubscriptionTier = async (req, res) => {
  try {
    const { id } = req.params;

    const tier = await SubscriptionTier.findByPk(id);
    if (!tier) {
      return res.status(404).json({ message: 'Subscription tier not found' });
    }

    await tier.destroy();
    res.status(200).json({ message: 'Subscription tier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subscription tier', error: error.message });
  }
};
