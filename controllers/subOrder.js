const SubscriptionOrder = require("../models/SubscriptionOrderModel");
const Subscription = require("../models/SubscriptionModel");
const User = require("../models/Usermodel");
const { createBookNotification } = require("../utils/notificationService");

const {
  subsOrderSchema,
  orderStatusSchema,
  paramsSchema,
  orderNumberSchema,
  dayBetweenSchema,
} = require("../helpers/schema");

const purchaseSubscriptionOrder = async (req, res) => {
  const { error: bodyError } = subsOrderSchema.validate(req.body);

  if (bodyError) {
    return res
      .status(400)
      .json({ success: false, message: bodyError.details[0].message });
  }

  const userId = req.user.id;
  const { subscriptionType } = req.body;

  try {
    if (!req.files?.path) {
      return res
        .status(400)
        .json({ success: false, message: "image is required" });
    }

    let totalPrice;
    if (subscriptionType === "Monthly") {
      totalPrice = req.subscription?.price;
    }
    if (subscriptionType === "Yearly") {
      totalPrice = req.subscription?.price * 12;
    }
    const orderNumber = `subOrder-${Date.now()}`;

    await SubscriptionOrder.create({
      user_id: userId,
      subscription_id: req.subscription?.id,
      totalPrice,
      receiptImage: req.file?.path,
      subscriptionType,
      orderNumber,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Subscription order created successfully",
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating subscription order", error });
  }
};

const updateSubscriptionOrderStatus = async (req, res) => {
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

  try {
    let order;
    order = await SubscriptionOrder.findByPk(Number(id));

    if (!order) {
      return res.status(404).json({ message: "Subscription order not found" });
    }

    order.reviewedBy = adminName;
    order.status = status;
    await order.save();

    const user = await User.findByPk(order.user_id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (status === "APPROVED" && order.subscriptionType === "Yearly") {
      const currentDate = new Date();
      user.subscription_id = order.subscription_id;
      if (user?.role === "AUTHOR") {
        user.postLimitCount = 0;
        await user.save();
      } else {
        user.orderLimitCount = 0;
        await user.save();
      }

      user.expirationDate = new Date(
        currentDate.setFullYear(currentDate.getFullYear() + 1)
      );

      await user.save();

      await createBookNotification(
        {
          title: `Dear ${user?.fname} your subscription order has been approved`,
          description: `hello, ${user?.fname}, ${adminName}  approved your subscription order for ${order?.subscriptionType} subscription plan for ${order.totalPrice} birr `,
        },
        user.id
      );
    } //end of if
    if (status === "APPROVED" && order.subscriptionType === "Monthly") {
      const currentDate = new Date();
      user.subscription_id = order.subscription_id;
      if (user?.role === "AUTHOR") {
        user.postLimitCount = 0;
        await user.save();
      } else {
        user.orderLimitCount = 0;
        await user.save();
      }

      user.expirationDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + 1)
      );

      await user.save();

      await createBookNotificatione(
        {
          title: `Dear ${user?.fname} your subscription order has been approved`,
          description: `hello, ${user?.fname}, ${adminName}  approved your subscription order for ${order?.subscriptionType} subscription plan for ${order.totalPrice} birr `,
        },
        user.id
      );
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Subscription order status updated successfully",
        order,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating subscription order status",
        error,
      });
  }
};

const getAllSubscriptionOrders = async (req, res) => {
  try {
    const orders = await SubscriptionOrder.findAll({
      include: [
        {
          model: Subscription,
          as: "forSubscription",
        },
        {
          model: User,
          as: "subscriptionUser",
          attributes: ["id", "fname", "lname", "imageFilePath", "orderCount"],
        },
      ],
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Subscription orders retrieved successfully",
        orders,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching subscription orders",
        error,
      });
  }
};
const getSubscriptionOrderById = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const { id } = req.params;

  try {
    const order = await SubscriptionOrder.findByPk(Number(id), {
      include: [
        {
          model: Subscription,
          as: "forSubscription",
        },
        {
          model: User,
          as: "subscriptionUser",
          attributes: ["id", "fname", "lname", "imageFilePath", "orderCount"],
        },
      ],
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription order not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Subscription order retrieved successfully",
        order,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching subscription order", error });
  }
};

const findSubscriptionOrderByOrderNumber = async (req, res) => {
  const { error } = orderNumberSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const { orderNumber } = req.params;

  try {
    const order = await SubscriptionOrder.findOne({
      where: { orderNumber },
      include: [
        {
          model: Subscription,
          as: "forSubscription",
        },
        {
          model: User,
          as: "subscriptionUser",
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

const getSubscriptionSalesReport = async (req, res) => {
  try {
    const totalRevenue = await SubscriptionOrder.sum("totalPrice");

    const averageRevenue = await SubscriptionOrder.aggregate(
      "totalPrice",
      "avg",
      {
        plain: false,
      }
    );

    const totalOrdersCount = await SubscriptionOrder.count();

    const report = {
      totalRevenue: totalRevenue || 0,
      averageRevenue: averageRevenue || 0,
      totalOrders: totalOrdersCount || 0,
    };

    return res.status(200).json({ success: true, report });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const getSubscriptionOrdersByStatus = async (req, res) => {
  const { error } = orderStatusSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { status } = req.params;

  try {
    const orders = await SubscriptionOrder.findAll({
      where: { status },
      attributes: [
        "id",
        "totalPrice",
        "subscriptionType",
        "orderNumber",
        "createdAt",
      ],
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getSubscriptionSalesReportByDateRange = async (req, res) => {
  const { error } = dayBetweenSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Start date and end date are required" });
  }

  try {
    const salesData = await SubscriptionOrder.findAll({
      where: {
        createdAt: {
          [Op.between]: [
            new Date(startDate),
            new Date(endDate).setHours(23, 59, 59, 999),
          ],
        },
      },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "totalRevenue"],
        [sequelize.fn("AVG", sequelize.col("totalPrice")), "averageRevenue"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalOrders"],
      ],
    });

    return res.status(200).json(salesData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  purchaseSubscriptionOrder,
  updateSubscriptionOrderStatus,
  getAllSubscriptionOrders,
  findSubscriptionOrderByOrderNumber,
  getSubscriptionOrderById,
  getSubscriptionSalesReport,
  getSubscriptionOrdersByStatus,
  getSubscriptionSalesReportByDateRange,
};
