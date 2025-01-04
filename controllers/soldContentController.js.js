
const { dayBetweenSchema, paramsSchema } = require('../helpers/schema');
const Book = require('../models/BookModel');
const Order = require('../models/OrderModel');
const SoldContent = require('../models/SoldContentModel');
const { Op } = require('sequelize');




const getSoldContentReport = async (req, res) => {
    try {
 
        const totalRevenueData = await SoldContent.sum('revenue');
        const totalServiceCharged = await SoldContent.sum('serviceCharged');
        const minServiceCharged = await SoldContent.min('serviceCharged');
        const maxServiceCharged = await SoldContent.min('serviceCharged');
        const count = await SoldContent.count();
        

        const report = {
            count: count || 0,
            totalRevenue: totalRevenueData || 0,  
            totalServiceCharged: totalServiceCharged || 0,
            minServiceCharged: minServiceCharged || 0,
            maxServiceCharged: maxServiceCharged || 0,
            
        };

        return res.status(200).json({success: true, report});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getSoldContentReportByDateRange = async (req, res) => {

    const { error } = dayBetweenSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
    }

    try {
        const salesData = await SoldContent.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)],
                },
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('revenue')), 'totalRevenue'],
                [sequelize.fn('AVG', sequelize.col('revenue')), 'averageRevenue'],
                [sequelize.fn('SUM', sequelize.col('revenue')), 'totalServiceCharged'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalChargeCount'],
            ],
           
        });

        return res.status(200).json({ success: true,salesData});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deleteSoldContent = async (req, res) => {
    try {
        const { error } = paramsSchema.validate(req.params);

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const { id } = req.params;
        
        const deleted = await SoldContent.destroy({
            where: { id: Number(id) }
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Sold content not found.' });
        }

        res.status(204).json({ success: true, message: 'Sold content deleted successfully.' });
    } catch (error) {
    
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllSoldContents = async (req, res) => {
    try {
        const {count,rows: soldContents} = await SoldContent.findAndCountAll({
            include: [
                {
                    model: Book,
                    as: 'soldBook',
                },
                {
                    model: Order,
                    as: 'orderedBook',
                } 
            ]
        });

        res.status(200).json({ success: true,count, data: soldContents, });
    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
    }
};

const getSoldContentById = async (req, res) => {
    try {
        const { error } = paramsSchema.validate(req.params);

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const { id } = req.params;
        const soldContent = await SoldContent.findOne(
            {
                 where: { id: Number(id) } ,
                 include: [
                    {
                        model: Book,
                        as: 'soldBook',
                    },
                    {
                        model: Order,
                        as: 'orderedBook',
                    }  
                ]
        });

        if (!soldContent) {
            return res.status(404).json({ success: false, message: 'Sold content not found.' });
        }

        res.status(200).json({
            success: true,
            data: soldContent,
        });
    } catch (error) {
        console.error('Error fetching sold content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllSoldContents,
    getSoldContentById,
    deleteSoldContent,
   getSoldContentReportByDateRange,
   getSoldContentReport,
};

