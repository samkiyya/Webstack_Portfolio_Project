const express = require('express');
const router = express.Router();
const assetUsageController = require('../controllers/assetUsageController'); // Import your controller

// Route to create asset usage
router.post('/', assetUsageController.createAssetUsage);

// Route to delete asset usage
router.delete('/:id', assetUsageController.deleteAssetUsage);
router.get('/book/:bookId', assetUsageController.getSingleBookUsage);

// Route to get usage report (by date range or all time)
router.get('/report', assetUsageController.getUsageReport);

module.exports = router;
