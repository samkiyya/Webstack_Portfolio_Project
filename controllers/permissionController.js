// controllers/permissionsController.js
const Permission = require('../models/permissionModel');
const User = require('../models/AdminModel');

// Create Permission
exports.createPermission = async (req, res) => {
  try {
    const { userId, roleName, module, canView, canCreate, canEdit, canDelete } = req.body;

    if (!userId || !roleName || !module) {
      return res.status(400).json({ error: 'Missing required fields: userId, roleName, and module are required' });
    }

    const permission = await Permission.create({
      userId,
      roleName,
      module,
      canView,
      canCreate,
      canEdit,
      canDelete
    });

    res.status(201).json(permission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ error: error.message || 'Error creating permission' });
  }
};

// Get All Permissions with User Information and Pagination
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fname', 'email'],
      }],
    });

    return res.status(200).json({
      success: true,
      permissions,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching permissions.',
    });
  }
};

// Get Single Permission with User Information by ID
exports.getPermissionByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const permissions = await Permission.findAll({
      where: { userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fname', 'email'],
      }],
    });

    if (permissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No permissions found for the given userId.',
      });
    }

    return res.status(200).json({
      success: true,
      permissions,
    });
  } catch (error) {
    console.error('Error fetching permissions by userId:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching permissions.',
    });
  }
};

// Update Permission by ID
exports.updatePermission = async (req, res) => {
  const { id } = req.params;
  const { userId, roleName, module, canView, canCreate, canEdit, canDelete } = req.body;

  try {
    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found',
      });
    }

    permission.userId = userId || permission.userId;
    permission.roleName = roleName || permission.roleName;
    permission.module = module || permission.module;
    permission.canView = canView !== undefined ? canView : permission.canView;
    permission.canCreate = canCreate !== undefined ? canCreate : permission.canCreate;
    permission.canEdit = canEdit !== undefined ? canEdit : permission.canEdit;
    permission.canDelete = canDelete !== undefined ? canDelete : permission.canDelete;

    await permission.save();

    return res.status(200).json({
      success: true,
      message: 'Permission updated successfully',
      permission,
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the permission.',
    });
  }
};

// Delete Permission by ID
exports.deletePermission = async (req, res) => {
  const { id } = req.params;

  try {
    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found',
      });
    }

    await permission.destroy();

    return res.status(200).json({
      success: true,
      message: 'Permission deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the permission.',
    });
  }
};
