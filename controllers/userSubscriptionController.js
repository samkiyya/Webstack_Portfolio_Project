const Subscription = require('../models/UserSubscriptionModel');
const SubscriptionTier = require('../models/subscriptionTriesModel');
const UserSubscription =require('../models/UserSubscriptionModel');
const User =require('../models/Usermodel');
const { Op } = require('sequelize');
// Create a Subscription
exports.createSubscription = async (req, res) => {
  const userId = req.user.id;
  try {
    const {  tier_id, start_date, end_date, bankName, approval_status } = req.body;
     // Validate receipt image
     if (!req.file || !req.file.path) {
        return res.status(400).json({ success: false, message: 'Receipt image required' });
    }
    const existingOrder = await Subscription.findOne({ where: { tier_id, user_id: userId } });
    if (existingOrder) {
        return res.status(400).json({ success: false, message: 'You have ordered this subscription before.' });
    }


    const subscription = await Subscription.create({
      user_id:userId,
      tier_id,
      start_date,
      end_date,
      bankName,
      receiptImagePath: req.file.path,
      approval_status,
    });

    res.status(201).json({ message: 'Subscription created successfully', data: subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error creating subscription', error: error.message });
  }
};

// Get All Subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      include: [{ model: SubscriptionTier, as: 'tier' }],
    });
    res.status(200).json({ message: 'Subscriptions fetched successfully', data: subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
  }
};

// Get Subscription by ID
exports.getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id, {
      include: [{ model: SubscriptionTier, as: 'tier' }],
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.status(200).json({ message: 'Subscription fetched successfully', data: subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription', error: error.message });
  }
};

// Update a Subscription
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;  // Get the subscription ID from the request parameters
    const { approval_status } = req.body;  // Get the approval status from the request body

    // Find the subscription by ID
    const subscription = await Subscription.findByPk(id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Update the approval status of the subscription
    await subscription.update({ approval_status });

    // Return the updated subscription
    res.status(200).json({ message: 'Subscription updated successfully', data: subscription });
  } catch (error) {
    // Handle any errors that occur during the update
    res.status(500).json({ message: 'Error updating subscription', error: error.message });
  }
};


// Delete a Subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    await subscription.destroy();
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subscription', error: error.message });
  }
};

exports.generateSubscriptionRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body; // Date range passed from the request body

    // Validate that both startDate and endDate are provided
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide both startDate and endDate.' });
    }

    // Fetch user subscriptions with the associated SubscriptionTier data (monthly_price, annual_price)
    const subscriptions = await UserSubscription.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(startDate), // Greater than or equal to the start date
          [Op.lte]: new Date(endDate),   // Less than or equal to the end date
        },
        approval_status: 'Approved', // Only consider approved subscriptions
      },
      include: [
        {
          model: SubscriptionTier,
          as: 'tier', // Alias used for the SubscriptionTier model
          attributes: ['tier_name', 'monthly_price', 'annual_price'],
        },
      ],
    });

    // Check if no subscriptions were found
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ message: 'No subscriptions found within the given date range.' });
    }

    // Fetch the first name (fname) for each userId in the subscriptions
    const subscriptionWithUserFnames = await Promise.all(
      subscriptions.map(async (subscription) => {
        const user = await User.findOne({ where: { id: subscription.user_id }, attributes: ['fname'] });
        // Attach the fname to the subscription object
        return { ...subscription.toJSON(), userFname: user ? user.fname : 'N/A' };
      })
    );

    // Return the report with user fname included
    res.status(200).json({
      message: 'Revenue report generated successfully',
      subscriptions: subscriptionWithUserFnames,
    });
  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({ message: 'Error generating revenue report', error: error.message });
  }
};


