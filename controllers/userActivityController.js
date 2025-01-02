const UserActivity = require('../models/userActivityModel');  // Adjust the import path based on your project structure
const User = require('../models/Usermodel');
// Create (Log Activity)
const logActivity = async (req, res) => {
  try {
    const { userId, actionType, actionDetails } = req.body;
    const activity = await UserActivity.create({
      userId,
      actionType,
      actionDetails,
    });

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: activity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Activities for a User
const getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const activities = await UserActivity.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],  // Order by the most recent activity
    });

    if (!activities.length) {
      return res.status(404).json({
        success: false,
        message: 'No activities found for this user',
      });
    }

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Activity Status (e.g., mark as completed, pending, etc.)
const updateActivityStatus = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { status } = req.body;

    const activity = await UserActivity.findByPk(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    await activity.update({ status });

    res.status(200).json({
      success: true,
      message: 'Activity status updated successfully',
      data: activity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Activity
const deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await UserActivity.findByPk(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    await activity.destroy();

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate Report for User Interactions (e.g., Count of Activities, Most Common Actions)
const generateUserActivityReport = async (req, res) => {
  try {
  

    // Get all activities for the user
    const activities = await UserActivity.findAll();

    if (!activities.length) {
      return res.status(404).json({
        success: false,
        message: 'No activities found for this user',
      });
    }

    // Group by actionType (e.g., BOOK_PURCHASE, BOOK_READ, etc.)
    const activityCount = activities.reduce((acc, activity) => {
      const type = activity.actionType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Get the most recent activity (optional)
    const latestActivity = activities[0];

    // Calculate the total number of activities
    const totalActivities = activities.length;

    res.status(200).json({
      success: true,
      data: {
        totalActivities,
        activityCount,
        latestActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getAllUserActivities = async (req, res) => {
    try {
        const activities = await UserActivity.findAll();

        // Fetch user details for each activity
        const activitiesWithUserDetails = await Promise.all(
            activities.map(async (activity) => {
                const user = await User.findOne({ where: { id: activity.userId } });
                return {
                    ...activity.toJSON(),
                    user: user ? { fname: user.fname, lname: user.lname } : null,
                };
            })
        );

        res.status(200).json({
            success: true,
            data: activitiesWithUserDetails,
        });
    } catch (error) {
        console.error("Error fetching user activities:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user activities",
        });
    }
};


module.exports = {
  logActivity,
  getUserActivities,
  updateActivityStatus,
  deleteActivity,
  generateUserActivityReport,
  getAllUserActivities
};
