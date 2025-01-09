
const  Book  = require('../models/BookModel'); 
const  Audio  = require('../models/AudioModel'); 
const  User  = require('../models/Usermodel'); 
const  Category  = require('../models/CategoryModel'); 
const  Order  = require('../models/OrderModel'); 
const { Op ,fn} = require('sequelize');
const sequelize = require('../config/db');
const { paramsSchema, dayBetweenSchema } = require('../helpers/schema');




const getAverageSalesPrice = async (req, res) => {
    try {
        const averageSales = await Order.findAll({
            where: {
                status: 'APPROVED' 
            },
            attributes: [[sequelize.fn('AVG', sequelize.col('price')), 'averagePrice']]

        });

        return res.status(200).json({success: true, averageSales: averageSales[0].dataValues.averagePrice || 0 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};



const getSalesReportByBookId = async (req, res) => {
    try {
        const {error} = paramsSchema.validate(req.params);

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const { id } = req.params;
        const salesReport = await Book.findAll({
            where: {
               // status: 'APPROVED',
                id: Number(id),
            },
            attributes: [
                'id', 'title','author',         
            ],
            include: [
             {
                model: Order,
                as: 'order',
                required: true,
                attributes: ['id', 'price','type','serviceCharged', [sequelize.fn('SUM', sequelize.col('Book.price')), 'totalSales'],
                [sequelize.fn('COUNT', sequelize.col('book_id')), 'totalSoldCount']
             ]
            }
         ],
           // group: ['book_id'],
          
        });

        if (salesReport.length === 0) {
            return res.status(404).json({ message: 'No sales data found.' });
        }

        return res.status(200).json(salesReport);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error',error : error.message });
    }
};


const getBestSellingBooks = async (startDate, endDate) => {
    return await Order.findAll({
        where: {
         status: "APPROVED",  createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate).setHours(23, 59, 59, 999)]
        }
        },
        attributes: [
            'book_id', 
            [sequelize.fn('SUM', sequelize.col('Order.price')), 'totalSold'], 
            [sequelize.fn('COUNT', sequelize.col('Order.book_id')), 'totalSoldcount'], 
        ],
        group: ['book_id'],
        include: [
            {
                model: Book,
                as: 'orderBook',
                attributes: ['id', 'title'], 
            }
        ],
        order: [[sequelize.fn('SUM', sequelize.col('Orderprice')), 'DESC']], 
    });
};

const getBestSellingBooksLastMonth = async (req, res) => {
    const today = new Date();
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); 

    try {
        const bestSellingBooks = await getBestSellingBooks(lastMonthStart, lastMonthEnd);
        res.status(200).json(bestSellingBooks);
    } catch (error) {
        console.error('Error fetching best-selling books for last month:', error);
        res.status(500).json({ message: 'Error fetching best-selling books for last month' });
    }
};



const getBestSellingBooksLastYear = async (req, res) => {
    const today = new Date();
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31); 

    try {
        const bestSellingBooks = await getBestSellingBooks(lastYearStart, lastYearEnd);
        res.status(200).json(bestSellingBooks);
    } catch (error) {
        console.error('Error fetching best-selling books for last year:', error);
        res.status(500).json({ message: 'Error fetching best-selling books for last year' });
    }
};

const getBestSellingBooksThisMonth = async (req, res) => {
    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1); 
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0); 

    try {
        const bestSellingBooks = await getBestSellingBooks(thisMonthStart, thisMonthEnd);
        res.status(200).json(bestSellingBooks);
    } catch (error) {
        console.error('Error fetching best-selling books for this month:', error);
        res.status(500).json({ message: 'Error fetching best-selling books for this month' });
    }
};

const getBestSellingBooksThisYear = async (req, res) => {
    const today = new Date();
    const thisYearStart = new Date(today.getFullYear(), 0, 1); 
    const thisYearEnd = new Date(today.getFullYear(), 11, 31); 

    try {
        const bestSellingBooks = await getBestSellingBooks(thisYearStart, thisYearEnd);
        res.status(200).json(bestSellingBooks);
    } catch (error) {
        console.error('Error fetching best-selling books for this year:', error);
        res.status(500).json({ message: 'Error fetching best-selling books for this year' });
    }
};

const getBestSellingBooksByDateRange = async (req, res) => {
    const {error} = dayBetweenSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { startDate, endDate } = req.body; 

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Please provide both startDate and endDate' });
    }

    try {
        const bestSellingBooks = await getBestSellingBooks(startDate, endDate);
        res.status(200).json(bestSellingBooks);
    } catch (error) {
        console.error('Error fetching best-selling books by date range:', error);
        res.status(500).json({ message: 'Error fetching best-selling books by date range' });
    }
};


const getBestSellingBooksLast7Days = async (req, res) => {
    try {
        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);

        const {count, rows: bestSellingBooks }  = await Order.findAndCountAll({
            where: {
                createdAt: {
                    [Op.between]: [lastWeek, today]
                }
                ,
                status: "APPROVED"
                
            },
            attributes: [
                'book_id',
                [sequelize.fn('COUNT', sequelize.col('book_id')), 'totalSold'],
                [sequelize.fn('SUM', sequelize.col('Order.price')), 'totalprice'],
            ],
            group: ['book_id'],
            include: [
                {
                    model: Book,
                    as: 'orderBook',
                    attributes: ['id', 'title'], 
                }
            ],
            order: [[sequelize.fn('SUM', sequelize.col('Order.price')), 'DESC']], 
        });

        res.status(200).json({success: true, count, bestSellingBooks});
    } catch (error) {
        console.error('Error fetching best-selling books:', error);
        res.status(500).json({ message: 'Error fetching best-selling books' });
    }
};


const fetchTotalSales = async (req, res) => {
    try {
        const totalSales = await Order.sum('price', {
            where: {
                status: 'APPROVED'
            }
            
        }); 
        const Sales = await Order.findAll( {
            where: {
                status: 'APPROVED'
            },
            include: [
              
                    {
                        model: Book,
                        as: 'orderBook',
                        attributes: ['id', 'title'], 
                    },
                
                    {
                        model: User,
                        as: 'orderUser',
                        attributes: ['id', 'fname'], 
                    },
            ],     
        }); 
        res.status(200).json({ totalSales:totalSales || 0 ,sales:Sales});
    } catch (error) {
        console.error('Error calculating total sales:', error);
        res.status(500).json({ message: 'Error calculating total sales' });
    }
};

const fetchOrdersWithBookInfo = async (req, res) => {
    try {
      // Extract parameters from request body
      const { startDate, endDate, book_id } = req.body;
  
      // Validate input
      if (!startDate || !endDate || !book_id) {
        return res.status(400).json({
          message: "startDate, endDate, and book_id are required fields.",
        });
      }
  
      // Fetch orders with associated book details
      const orders = await Order.findAll({
        where: {
          book_id: book_id, // Use book_id consistently
          status: 'approved',
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
        include: [
          {
            model: Book,
            as: 'orderBook', // Use the correct alias 'orderBook' here
          },
        ],
      });
  
      // Return the results
      return res.status(200).json({ orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'An error occurred while fetching orders' });
    }
  };
  



const getSalesReportForLoggedInAuthor = async (req, res) => {
    
    try {
        const { id } = req.user; 
        const salesReport = await User.findAll({
            where: {
                //status: 'APPROVED',
                id:Number(id),
            },
            attributes: [ 'id', 'fname',],
          
            include: [
                {
                    model: Book,
                    as: 'book',
                    attributes: ['id', 'title', 'author',
                       // [sequelize.fn('COUNT', sequelize.col('book.author_id')), 'mypostCount']
                    ],
                     include: [
                        {
                            model: Order,
                            as: 'order',
                            attributes: ['id', 'price', 'serviceCharged'
                                ,[sequelize.fn('SUM', sequelize.col('book.order.price')), 'totalSales'],
                                [sequelize.fn('COUNT', sequelize.col('book.order.book_id')), 'bookSoldCount']
                                
                            ],
                           
                        }
                         
                     ],
              
                },
                
                
            ],
           // group: ['orderBook.id',],
          //  order: [[sequelize.fn('SUM', sequelize.col('Order.price')), 'DESC']],
            //raw: true, 
        });

        if (salesReport.length === 0) {
            return res.status(404).json({ message: 'No sales found for this author.' });
        }

        res.status(200).json(salesReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTotalSalesReportByAuthorId = async (req, res) => {
    
    try {
        const {error} = paramsSchema.validate(req.params);

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { id } = req.params; 
        const salesReport = await User.findAll({
            where: {
                //status: 'APPROVED',
                id:Number(id),
            },
            attributes: [ 'id', 'fname',],
          
            include: [
                {
                    model: Book,
                    as: 'book',
                    attributes: ['id', 'title', 'author',
                       // [sequelize.fn('COUNT', sequelize.col('book.author_id')), 'mypostCount']
                    ],
                     include: [
                        {
                            model: Order,
                            as: 'order',
                            attributes: ['id', 'price', 'serviceCharged'
                                ,[sequelize.fn('SUM', sequelize.col('book.order.price')), 'totalSales'],
                                [sequelize.fn('COUNT', sequelize.col('book.order.book_id')), 'bookSoldCount']
                                
                            ],
                           
                        }
                         
                     ],
              
                },
                
                
            ],
           // group: ['orderBook.id',],
          //  order: [[sequelize.fn('SUM', sequelize.col('Order.price')), 'DESC']],
            //raw: true, 
        });

        if (salesReport.length === 0) {
            return res.status(404).json({ message: 'No sales found for this author.' });
        }

        res.status(200).json(salesReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getTopBuyers = async (req, res) => {
    try {
      const topBuyers = await Order.findAll({
        attributes: {
            include: [
            
              [sequelize.fn('COUNT', sequelize.col('Order.id')), 'totalOrders'],
              [sequelize.fn('MIN', sequelize.col('Order.price')), 'minSpent'],
              [sequelize.fn('MAX', sequelize.col('Order.price')), 'maxSpent'],
              [sequelize.fn('SUM', sequelize.col('Order.price')), 'totalSpent'],
            ],
          },

        include:[ {
          model: User,
          as: 'orderUser',
          attributes: ['id', 'fname', 'email'],
       
        }
    ],
        
        
        limit: 10, 
        group: ['orderUser.id'],
        order: [['totalSpent', 'DESC']],
        
      });
  
      res.json(topBuyers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while fetching data.', error: error.message });
    }
  };


  const getTopSellersAuthors = async (req, res) => {
    try {
        const topSellers = await User.findAll({
            where: {
                role: 'AUTHOR', 
            },
            attributes: [
                'id', 
                'fname',
                
            ],
            include: [{
                model: Order,
                as: 'order',
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('order.id')), 'totalOrders'],
                    [sequelize.fn('MIN', sequelize.col('price')), 'minSpent'],
                    [sequelize.fn('MAX', sequelize.col('price')), 'maxSpent'],
                    [sequelize.fn('SUM', sequelize.col('order.price')), 'totalSpent'],
                ],
                
                group: ['order.id'], 
            }],
            limit: 10, 
            group: ['User.id'], 
        
        });

        res.json(topSellers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching data.', error: error.message });
    }
};


  const getTotalSpentByUsers = async (req, res) => {
    try {
        const results = await Order.findAll({
            attributes: [
                'id',
              
               [sequelize.fn('SUM', sequelize.col('Order.price')), 'totalSpent'] ,
               [sequelize.fn('MAX', sequelize.col('Order.price')), 'maxSpent'] ,
               [sequelize.fn('MIN', sequelize.col('Order.price')), 'minSpent'] ,
               [sequelize.fn('AVG', sequelize.col('Order.price')), 'averageSpent'] ,
               [sequelize.fn('COUNT', sequelize.col('Order.user_id')), 'totalOrders'] 
            ],
            include: [
                {
                    model: User,
                    as: 'orderUser',
                    attributes: ['id', 'fname', 'email'],
                 
                }
            
            ],
          group: ['orderUser.id', ], 
           // raw: true
        });

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    getTotalSpentByUsers,
    getTopBuyers,
    getSalesReportForLoggedInAuthor,
    getTotalSalesReportByAuthorId,
    getTopSellersAuthors,
    getSalesReportByBookId,
    fetchTotalSales,
    getBestSellingBooksLast7Days,
    getAverageSalesPrice,
    getBestSellingBooksLastMonth,
    getBestSellingBooksLastYear,
    getBestSellingBooksThisMonth,
    getBestSellingBooksThisYear,
    getBestSellingBooksByDateRange,
    fetchOrdersWithBookInfo
};
