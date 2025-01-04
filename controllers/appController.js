const  Book  = require('../models/BookModel'); 
const  Audio  = require('../models/AudioModel'); 
const  User  = require('../models/Usermodel'); 
const  Category  = require('../models/CategoryModel'); 
const  Review  = require('../models/ReviewModel'); 
const  Order  = require('../models/OrderModel'); 
const { Op } = require('sequelize');
const { filterQuerySchema, filterBodySchema } = require('../helpers/schema');

/*
const getSalesStatistics = async (req, res) => {
    try {


        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); 
        const lastSixMonthsStart = new Date(today.setMonth(today.getMonth() - 6));

        const calculateStatistics = async (startDate, endDate) => {
            const result = await Order.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [startDate, endDate],
                    },
                    status: 'APPROVED', 
                },
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('order_id')), 'totalSoldCount'],
                    [sequelize.fn('SUM', sequelize.col('price')), 'totalSoldPrice'],
                    [sequelize.fn('SUM', sequelize.col('serviceCharged')), 'totalSoldserviceCharged'],
                    [sequelize.fn('MIN', sequelize.col('price')), 'minSold'],
                    [sequelize.fn('MAX', sequelize.col('price')), 'maxSold'],
                    [sequelize.fn('AVG', sequelize.col('price')), 'avgSold'],
                ],
            });
            return result[0] || {}; 
        };

        const allTimeStats = await calculateStatistics(new Date(0), today);
        const lastMonthStats = await calculateStatistics(lastMonthStart, lastMonthEnd);
        const thisMonthStats = await calculateStatistics(startOfMonth, today);
        const lastSixMonthsStats = await calculateStatistics(lastSixMonthsStart, today);
        const thisYearStats = await calculateStatistics(startOfYear, today);

        
        const response = {
            allTime: allTimeStats,
            lastMonth: lastMonthStats,
            thisMonth: thisMonthStats,
            lastSixMonths: lastSixMonthsStats,
            thisYear: thisYearStats,
        };

        res.status(200).json(response);
    } catch (error) {
        
        res.status(500).json({ message: 'Error fetching sales statistics' });
    }
}; */

const fetchUsersWithFiltersFromAdmin = async (req, res) => {
    const { error: queryError } = filterQuerySchema.validate(req.query);
    
    if (queryError) {
        return res.status(400).json({ success: false, message: queryError.details[0].message });
    }

    const { error: bodyError } = filterBodySchema.validate(req.body);
    
    if (bodyError) {
        return res.status(400).json({ success: false, message: bodyError.details[0].message });
    }


    const { page = 1, size = 10, fname, lname,   sortBy,city,country,  	point,	userInvited,referalCode,isTwoStepOn,role  } = req.query;
    const{orderCount,postCount, isActive, isVerified,last7days, provider} =req.body
    try {
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    let whereCondition = {};     
       if (isNaN(limit) || isNaN(offset)) {
           return res.status(400).json({ success: false, message: 'Invalid pagination parameters.' });
       }
   

  
    if (fname) {
        whereCondition.fname = { [Op.like]: `%${fname}%`  }; 

    }
  
    if (lname) {
        whereCondition.lname = { [Op.like]: `%${lname}%` };
    }
    if (referalCode) {
        whereCondition.referalCode = { [Op.like]: `%${referalCode}%` };
    }
    
    if (postCount) {
        whereCondition.postCount = { [Op.gte]: postCount };
    }
    if (orderCount) {
        whereCondition.orderCount = { [Op.gte]: orderCount };
    }
    if (point) {
        whereCondition.point = { [Op.gte]: point };
    }
    if (userInvited) {
        whereCondition.userInvited = { [Op.gte]: userInvited };
    }

    if (isVerified) {
        whereCondition.isVerified = isVerified;
    }
    if (isActive) {
        whereCondition.isActive = isActive;
    }

    if (provider) {
        whereCondition.provider = provider;
    }
    if (city) {
        whereCondition.city = city;
    }
    if (country) {
        whereCondition.country = country;
    }
    if (role) {
        whereCondition.role = role;
    }
    if (isTwoStepOn) {
        whereCondition.isTwoStepOn = isTwoStepOn;
    }

    if (last7days === true) {
        const lastWeekDate = new Date();
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        whereCondition.createdAt = { [Op.gte]: lastWeekDate };
    }
  
  
    let order;
    if (sortBy === 'fnameAsc') {
        order = [['fname', 'ASC']];
    } else if (sortBy === 'fnameDesc') {
        order = [['fname', 'DESC']];
    } else if (sortBy === 'levelAsc') {
        order = [['level', 'ASC']];
    } else if (sortBy === 'levelDesc') {
        order = [['level', 'DESC']];
    }
    if (sortBy === 'userInvitedDesc') {
        order = [['userInvited', 'DESC']];
    } else if (sortBy === 'userInvitedAsc') {
        order = [['userInvited', 'ASC']];
    }  else {
        order = [['createdAt', 'DESC']]; 
    }

    
        const { count, rows } = await User.findAndCountAll({
            where: whereCondition,
            attributes: {
               
                exclude: ['password', 'subscription_id', ], 
            },
            limit,
            offset,
            order,
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            totalUsers: count,
            users: rows,
            totalPages,
            currentPage: page,
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error: error.message});
    }
};

module.exports = {
   //getSalesStatistics,
    fetchUsersWithFiltersFromAdmin,
};