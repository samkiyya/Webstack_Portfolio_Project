const  AssetUsage  = require('../models/assetUsageModel'); // Import your AssetUsage model
const  User  = require('../models/Usermodel'); // Import your User model
const  Book  = require('../models/BookModel'); // Import your Book model
const { Op } = require('sequelize');

// Create Asset Usage
const createAssetUsage = async (req, res) => {
    try {
        const { userId, bookId, pagesRead, totalTimeSpent, isIdle } = req.body;
        
        // Create a new AssetUsage record
        const assetUsage = await AssetUsage.create({
            userId,
            bookId,
            pagesRead,
            totalTimeSpent,
            isIdle,
        });

        res.status(201).json({
            success: true,
            message: 'Asset usage recorded successfully',
            data: assetUsage,
        });
    } catch (error) {
        console.error("Error creating asset usage:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to record asset usage',
        });
    }
};

// Delete Asset Usage
const deleteAssetUsage = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the record by ID and delete
        const deletedRecord = await AssetUsage.destroy({
            where: { id }
        });

        if (!deletedRecord) {
            return res.status(404).json({
                success: false,
                message: 'Asset usage record not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Asset usage record deleted successfully',
        });
    } catch (error) {
        console.error("Error deleting asset usage:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete asset usage record',
        });
    }
};
const getUsageReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Fetch asset usage data
        const usageData = await AssetUsage.findAll({
            where: {
                ...(startDate && endDate && {
                    interactionDate: {
                        [Op.between]: [new Date(startDate), new Date(endDate)],
                    },
                }),
            },
        });

        if (!usageData || usageData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No usage data found for the given period',
            });
        }

        // Fetch user and book data for each asset usage entry
        const enhancedUsageData = await Promise.all(
            usageData.map(async (usage) => {
                const user = await User.findByPk(usage.userId, {
                    attributes: ['fname', 'lname'],
                });
                const book = await Book.findByPk(usage.bookId, {
                    attributes: ['title'],
                });

                return {
                    ...usage.toJSON(),
                    user: user ? user.toJSON() : null,
                    book: book ? book.toJSON() : null,
                };
            })
        );

        res.status(200).json({
            success: true,
            message: 'Asset usage report fetched successfully',
            data: enhancedUsageData,
        });
    } catch (error) {
        console.error('Error fetching usage report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch asset usage report',
        });
    }
};

const getSingleBookUsage = async (req, res) => {
    try {
        const { bookId } = req.params; // Extract the bookId from request params

        if (!bookId) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required",
            });
        }

        // Fetch asset usage data for the given book ID
        const usageData = await AssetUsage.findAll({
            where: { bookId },
        });

        if (!usageData || usageData.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No usage data found for the specified book",
            });
        }

        // Fetch user and book details, including the book's author
        const enhancedUsageData = await Promise.all(
            usageData.map(async (usage) => {
                const user = await User.findByPk(usage.userId, {
                    attributes: ["fname", "lname"],
                });

                const book = await Book.findByPk(usage.bookId, {
                    attributes: ["title"],
                    include: [
                        {
                            model: User,
                            as: "bookAuthor", // Alias defined in association
                            attributes: ["fname", "lname"], // Author's details
                            where: { role: "AUTHOR" }, // Fetch only authors
                        },
                    ],
                });

                return {
                    ...usage.toJSON(),
                    user: user ? user.toJSON() : null,
                    book: book ? book.toJSON() : null,
                };
            })
        );

        res.status(200).json({
            success: true,
            message: "Book usage data fetched successfully",
            data: enhancedUsageData,
        });
    } catch (error) {
        console.error("Error fetching book usage data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch book usage data",
        });
    }
};


module.exports = {
    createAssetUsage,
    deleteAssetUsage,
    getUsageReport,
    getSingleBookUsage
};
