const express = require('express');
const router = express.Router();
const { logActivity, getUserActivities, updateActivityStatus, deleteActivity, generateUserActivityReport,getAllUserActivities} = require('../controllers/userActivityController');

// Log an activity (Create)
router.post('/', logActivity);

// Get all activities for a user (Read)
router.get('/:userId', getUserActivities);

// Update activity status (Update)
router.put('/:activityId/status', updateActivityStatus);

// Delete activity (Delete)
router.delete('/:activityId', deleteActivity);
router.get('/', getAllUserActivities);

// Generate user activity report (Report)
router.get('/report', generateUserActivityReport);

module.exports = router;
