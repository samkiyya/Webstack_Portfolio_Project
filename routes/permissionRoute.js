// routes/permissionsRoutes.js
const express = require('express');
const { verifyAdmin } = require('../middlewares/auth');  // Import verifyAdmin middleware
const {
  createPermission,
  getAllPermissions,
  getPermissionByUserId,
  updatePermission,
  deletePermission
} = require('../controllers/permissionController');

const router = express.Router();

// Apply verifyAdmin middleware to the routes
router.use(verifyAdmin);

// Routes for managing permissions
router.post('/permissions', createPermission);
router.get('/permissions', getAllPermissions);
router.get('/permissions/user/:userId', getPermissionByUserId);
router.put('/permissions/:id', updatePermission);
router.delete('/permissions/:id', deletePermission);

module.exports = router;
