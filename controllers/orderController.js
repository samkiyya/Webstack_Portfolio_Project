const Order = require("../models/OrderModel");
const Book = require("../models/BookModel");
const User = require("../models/Usermodel");
const { createBookNotification } = require("../utils/notificationService");

const Category = require("../models/CategoryModel");
const SoldContent = require("../models/SoldContentModel");
const { Op } = require("sequelize");
const {
  paramsSchema,
  orderStatusSchema,
  orderNumberSchema,
  dayBetweenSchema,
  placeOrderSchema,
} = require("../helpers/schema");
const Level = require("../models/LevelModel");

const ApproveOrUpdateOrderStatus = async (req, res) => {
  try {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { error: bodyError } = orderStatusSchema.validate(req.body);

    if (bodyError) {
      return res
        .status(400)
        .json({ success: false, message: bodyError.details[0].message });
    }

    const adminName = req.user.fname;
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByPk(Number(id));

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    order.reviewedBy = adminName;

    await order.save();

    if (status === "APPROVED") {
      const tempPoint = 100;
      const user = await User.findByPk(order.user_id);

      const book = await Book.findByPk(order.book_id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      book.sold++;
      const currentSold = book.sold + 1;
      book.revenue =
        book.price * currentSold - book.price * (book.serviceCharges / 100);
      await book.save();
      const soldContent = await SoldContent.create({
        book_id: book.id,
        order_id: order.id,
        revenue: book.price * (book.serviceCharges / 100),
        approvedBy: adminName,
        receiptImage: order.receiptImagePath,
      });
      await soldContent.save();

      const author = await User.findByPk(book.author_id);
      if (!book.author_id) {
        throw new Error(`Author ID for the book ${book.title} is missing`);
      }

      if (!order.user_id) {
        throw new Error(`User ID for the order ${order.id} is missing`);
      }
      await createBookNotification(
        {
          title: `your book ${book.title} is sold`,
          description: `hello, ${author?.fname}  ${adminName} sold your book ${book.title} with ${book.serviceCharges}% service charge and revenue ${book.revenue} birr  `,
        },
        book.author_id
      );
      await createBookNotification(
        {
          title: `your order for ${book.title} is approved`,
          description: `hello, ${user?.fname} ${adminName} approved your order for ${book.title} now you can access it and you got ${tempPoint} points for ordering this book`,
        },
        order.user_id
      );

      if (parseInt(user.point) < 9) {
        user.point = parseInt(user.point) + tempPoint;
        await user.save();
        //console.log(user.point, 'hhhhh')
      } //point
      if (parseInt(user.point) >= 10) {
        const nextLevel = parseInt(user.level_id) + 1;
        const level = await Level.findByPk(nextLevel);
        if (level) {
          user.level_id = level.id;
          user.point = 0;
          await user.save();
        } else {
          user.point = parseInt(user.point) + tempPoint;
          await user.save();
        }
      }
      user.orderCount++;
      user.orderLimitCount++;

      await user.save();
    }

    res.status(200).json({
      success: false,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const placeOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    const { bankName, transactionNumber, book_id, type } = req.body;

    // Validate book_id
    if (!book_id) {
      return res
        .status(400)
        .json({ success: false, message: "Book ID required" });
    }

    // Validate receipt image
    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ success: false, message: "Receipt image required" });
    }

    // Check if the book exists
    const book = await Book.findByPk(book_id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

// Check if the user has already ordered this book with type 'both'
const existingOrderBoth = await Order.findOne({
  where: { book_id, user_id: userId, type: 'both' },
});

    if (existingOrderBoth) {
      return res.status(400).json({
        success: false,
        message: "You have already ordered this book with both types.",
      });
    }

    // Check if the user has already ordered the same book with the same type
    const existingOrder = await Order.findOne({
      where: { book_id, user_id: userId, type },
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "You have already ordered this book with the same type.",
      });
    }

    // Check if the user has ordered the book with a different type (not 'both')
    const existingOrderDifferentType = await Order.findOne({
      where: { book_id, user_id: userId, type: { [Op.ne]: 'both' } }, // Op.ne ensures type is not 'both'
    });

    if (existingOrderDifferentType) {
      // Update the type of the previous order to 'both'
      await existingOrderDifferentType.update({ type: 'both' });

      return res.status(200).json({
        success: true,
        message: "Your previous order has been updated to both types.",
        order: existingOrderDifferentType,
      });
    }

    

    // Generate unique order number
    const orderNumber = `bookOrder-${Date.now()}`;

    // Create new order
    const order = await Order.create({
      price: book.price,
      receiptImagePath: req.file.path,
      bankName,
      type,
      transactionNumber,
      orderNumber,
      book_id,
      user_id: userId,
    });

    res
      .status(201)
      .json({ success: true, message: "Order added successfully", order });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to add order",
      details: error.message,
    });
  }
};

const findOrderByOrderNumber = async (req, res) => {
  try {
    const { error } = orderNumberSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { orderNumber } = req.params;
    const order = await Order.findOne({
      where: { orderNumber },
      include: [
        {
          model: User,
          as: "orderUser",
          attributes: ["id", "fname", "lname", "imageFilePath"],
        },
        {
          model: Book,
          as: "orderBook",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Order retrieved successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrdersForLoggedInUsers = async (req, res) => {
  const user_id = req.user.id;

  try {
    const orders = await Order.findAll({
      where: { user_id },
      include: [
        {
          model: Book,
          as: "orderBook",
          // attributes: ['id', 'fname', 'lname','imageFilePath','postCount'],
          attributes: {
            exclude: [
              "serviceCharges",
              "revenue",
              "status",
              "reason",
              "reviewedBy",
            ],
          },
        },
        {
          model: User,
          attributes: ["id", "fname", "lname", "imageFilePath", "orderCount"],
          as: "orderUser",
        },
      ],
    });

    if (!orders.length) {
      return res.status(404).json({
        messsage: "No orders found for this users.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Order retrieved successfully", orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApprovedOrdersForLoggedInUsers = async (req, res) => {
  const user_id = req.user.id;
  // console.log(user_id);

  try {
    const orders = await Order.findAll({
      where: { user_id, status: "APPROVED" },
      include: [
        {
          model: Book,
          as: "orderBook",
          // attributes: ['id', 'fname', 'lname','imageFilePath','postCount'],
          attributes: {
            exclude: [
              "serviceCharges",
              "revenue",
              "status",
              "reason",
              "reviewedBy",
            ],
          },
        },
        {
          model: User,
          attributes: ["id", "fname", "lname", "imageFilePath", "orderCount"],
          as: "orderUser",
        },
      ],
    });
    console.log(orders);

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        messsage: "No approved orders found for this users.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Order retrieved successfully", orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUnApprovedOrderById = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { id } = req.params;

  try {
    const order = await Order.destroy({
      where: {
        id: Number(id),
        status: {
          [Op.ne]: "APPROVED",
        },
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, messsage: " Order not found." });
    }

    return res.json({ success: true, messsage: "Order deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, messsage: "Error deleting order", error });
  }
};

const deleteOrderById = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { id } = req.params;

  try {
    const order = await Order.destroy({
      where: { id: Number(id) },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, messsage: " Order not found." });
    }

    return res.json({ success: true, messsage: "Order deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, messsage: "Error deleting order", error });
  }
};

const fetchApprovedOrdersByUserId = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const id = req.params.id;

  try {
    const orders = await Order.findAll({
      where: { user_id: Number(id), status: "APPROVED" },
      include: [
        {
          model: User,
          attributes: ["id", "fname", "lname", "imageFilePath", "orderCount"],
          as: "orderUser",
        },
        { model: Book, as: "orderBook" },
      ],
    });

    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "Orders not found" });
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchOrdersByUserId = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { id } = req.params;

  try {
    const orders = await Order.findAll({
      where: { user_id: Number(id) },
      include: [
        {
          model: User,
          attributes: ["id", "fname", "lname", "imageFilePath", "orderCount"],
          as: "orderUser",
        },
        { model: Book, as: "orderBook" },
      ],
    });

    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "Orders not found" });
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { count, rows: orders } = await Order.findAndCountAll({
      include: [
        { model: Book, as: "orderBook" },
        {
          model: User,
          as: "orderUser",
          attributes: ["id", "fname", "lname", "imageFilePath", "orderCount"],
        },
      ],
    });
    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "Orders not found" });
    }

    res.status(200).json({ success: true, count, orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

const getAllOrdersBystatus = async (req, res) => {
  try {
    const { error } = orderStatusSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { status } = req.params;
    const orders = await Order.findAll({
      where: { status },
      include: [
        { model: Book, as: "orderBook" },
        {
          model: User,
          as: "orderUser",
          attributes: ["id", "fname", "lname", "imageFilePath"],
        },
      ],
    });
    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "Orders not found" });
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

const getOrdersBetweenDay = async (req, res) => {
  const { error } = dayBetweenSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { startDate, endDate } = req.body;
  try {
    const salesReport = await Order.findAll({
      where: {
        createdAt: {
          [Op.between]: [
            new Date(startDate),
            new Date(endDate).setHours(23, 59, 59, 999),
          ],
        },
      },
      include: [
        { model: Book, as: "orderBook" },

        {
          model: User,
          as: "orderUser",
          attributes: ["id", "fname", "lname", "imageFilePath"],
        },
      ],
    });

    //const totalSales = salesReport.reduce((acc, order) => acc + order.price, 0);

    res.status(200).json({ success: true, salesReport });
  } catch (error) {
    res.status(500).json({ message: "Error generating sales report" });
  }
};

const getApprovedOrdersBetweenDay = async (req, res) => {
  const { error } = dayBetweenSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { startDate, endDate } = req.body;
  try {
    const salesReport = await Order.findAll({
      where: {
        createdAt: {
          [Op.between]: [
            new Date(startDate),
            new Date(endDate).setHours(23, 59, 59, 999),
          ],
        },

        status: "APPROVED",
      },
      include: [
        { model: Book, as: "orderBook" },

        {
          model: User,
          as: "orderUser",
          attributes: ["id", "fname", "lname", "imageFilePath"],
        },
      ],
    });

    //const totalSales = salesReport.reduce((acc, order) => acc + order.price, 0);

    res.status(200).json({ success: true, salesReport });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ message: "Error generating sales report" });
  }
};

const getOrderById = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { id } = req.params;
  try {
    const order = await Order.findOne({
      where: { id: Number(id) },
      include: [
        { model: Book, as: "orderBook" },
        {
          model: User,
          as: "orderUser",
          attributes: ["id", "fname", "lname", "imageFilePath"],
        },
      ],
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
};

const getTodayOrders = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayOrders = await Order.findAll({
      where: { createdAt: { [Op.gte]: todayStart } },
      include: [
        { model: Book, as: "orderBook" },
        {
          model: User,
          as: "orderUser",
          attributes: ["id", "fname", "lname", "imageFilePath", "orderCount"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      orders: todayOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const getLast7DaysOrders = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7DaysOrders = await Order.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      include: [
        { model: Book, as: "orderBook" },
        {
          model: User,
          as: "orderUser",
          attributes: ["id", "fname", "lname", "imageFilePath", "orderCount"],
        },
      ],
    });
    if (!last7DaysOrders.length) {
      return res
        .status(404)
        .json({ success: false, message: "There is no order yet" });
    }
    res.status(200).json({
      success: true,
      orders: last7DaysOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const getLast7DaysApprovedOrders = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7DaysOrders = await Order.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo, status: "APPROVED" } },
      include: [
        { model: Book, as: "orderBook" },
        {
          model: User,
          as: "orderUser",
          attributes: ["id", "fname", "lname", "imageFilePath", "orderCount"],
        },
      ],
    });
    if (!last7DaysOrders.length) {
      return res
        .status(404)
        .json({ success: false, message: "There is no order yet" });
    }

    res.status(200).json({
      success: true,
      orders: last7DaysOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const fetchApprovedOrdersWithUsersForBook = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { id } = req.params;

  try {
    const orders = await Order.findAll({
      where: { book_id: Number(id), status: "APPROVED" },
      include: [
        {
          model: User,
          as: "orderUser",
          attributes: ["id", "fname", "lname", "imageFilePath", "orderCount"],
        },
      ],
    });

    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "Book does not has order yet" });
    }

    res.status(200).json({
      success: true,
      message: " Order fetched for this successfully",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: error.message });
  }
};

//   sales orders
const getReferalOrders = async (req, res) => {
  try {
    // Extract referral code from the request body
    const { referralCode } = req.body;

    // Validate input
    if (!referralCode) {
      return res.status(400).json({ message: "Referral code is required." });
    }

    // Find all users with the given referral code
    const users = await User.findAll({
      where: { referalCode: referralCode }, // Ensure column name matches database schema
    });

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found with this referral code." });
    }

    // Array to hold the users with orders
    let usersWithOrders = [];

    // Loop through each user and check if they have any orders
    for (const user of users) {
      const orders = await Order.findAll({
        where: { user_id: user.id }, // Assuming `user_id` refers to the User model
      });

      // If the user has orders, add to the result array
      if (orders.length > 0) {
        usersWithOrders.push({
          user: {
            id: user.id,
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            phone: user.phone,
            referalCode: user.referalCode,
            // Add any other user fields you want to return
          },
          orders,
        });
      }
    }

    // If no users with orders are found, return a message
    if (usersWithOrders.length === 0) {
      return res.status(404).json({
        message: "No orders found for users with this referral code.",
      });
    }

    // Return the users and their orders
    return res.status(200).json({
      message: "Users with orders retrieved successfully.",
      usersWithOrders,
    });
  } catch (error) {
    console.error("Error fetching referral orders:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching referral orders." });
  }
};

module.exports = {
  getApprovedOrdersBetweenDay,
  getApprovedOrdersForLoggedInUsers,
  getOrdersForLoggedInUsers,
  fetchApprovedOrdersWithUsersForBook,
  getLast7DaysApprovedOrders,
  deleteUnApprovedOrderById,
  deleteOrderById,
  fetchApprovedOrdersByUserId,
  fetchOrdersByUserId,
  getAllOrdersBystatus,
  getOrdersBetweenDay,
  getTodayOrders,
  getLast7DaysOrders,
  ApproveOrUpdateOrderStatus,
  placeOrder,
  findOrderByOrderNumber,
  getAllOrders,
  getOrderById,
  getReferalOrders,
};
