const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const multer = require("multer");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");
require("dotenv").config();

const { myPassportConfig } = require("./helpers/passportSetUp");

const sequelize = require("./config/db");
const defineAssociations = require("./models/associations");

// Importing routes
const categoryRoutes = require("./routes/categoryRoute");
const bookRoutes = require("./routes/bookRoute");
const authRoutes = require("./routes/authRoute");
const adminRoutes = require("./routes/adminRoute");
const reviewRoutes = require("./routes/reviewRoute");
const orderRoutes = require("./routes/orderRoute");
const userRoutes = require("./routes/userRoute");
const followingRoutes = require("./routes/followRoute");
const socialLoginRoutes = require("./routes/socialLoginRoute");
const subscriptionRoutes = require("./routes/subscriptionRoute");
const subscriptionOrderRoutes = require("./routes/subsOrderRoute");
const salesReport = require("./routes/salesReport");
const levels = require("./routes/levelRoute");
const accountRoute = require("./routes/accountRoute");
const communicationRoute = require("./routes/communicationRoute");
const notificationRoutes = require("./routes/notificationRoute");
const promoRoute = require("./routes/promoRoute");
const soldContentRoute = require("./routes/soldContentRoute");
const permissionRoute = require("./routes/permissionRoute");
const announcementRoute = require("./routes/announcementRoute");
const subscription = require("./routes/userSubscriptionRoute");
const qaulity = require("./routes/qaulityRoute");
const dashboardRoute = require("./routes/dashboardRoutes");
const reviewRoute = require("./routes/reviewFeedbackRoutes");
const initializeDatabase = require("./utils/initializeDataBase");
const userReview = require("./routes/userReviewRoute");
const userActivity = require("./routes/userActivity");
const assetUsageRoute = require("./routes/assetUsageRoute");
const salesManRoute=require('./routes/salesManRoute');
const salesmanPaymentRoutes = require('./routes/salesManPaymentsroute');


const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["PUT", "DELETE", "POST", "GET"],
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static("./public"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(passport.initialize());
myPassportConfig();

// Swagger documents
const swaggerDocs = {
  "/account-docs": require("./api-docs/account.json"),
  "/admin-docs": require("./api-docs/admin.json"),
  "/book-docs": require("./api-docs/book.json"),
  "/category-docs": require("./api-docs/category.json"),
  "/user-docs": require("./api-docs/user.json"),
  "/communication-docs": require("./api-docs/communication.json"),
  "/follow-docs": require("./api-docs/follow.json"),
  "/level-docs": require("./api-docs/level.json"),
  "/notification-docs": require("./api-docs/notification.json"),
  "/order-docs": require("./api-docs/order.json"),
  "/promotion-docs": require("./api-docs/promotion.json"),
  "/review-docs": require("./api-docs/review.json"),
  "/sold-docs": require("./api-docs/sold.json"),
  "/subscription-docs": require("./api-docs/subscription.json"),
  "/suborder-docs": require("./api-docs/suborder.json"),
  "/usersuborder-docs": require("./api-docs/userSubscription.json"),
  "/announcement-docs": require("./api-docs/announcment.json"),
};
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup());
for (const [route, doc] of Object.entries(swaggerDocs)) {
  app.use(route, swaggerUi.serve, (req, res, next) => {
    swaggerUi.setup(doc)(req, res, next);
  });
}

defineAssociations();

const PORT = process.env.PORT || 3001;

sequelize
  .sync({ force: false })
  .then(async () => {
    console.log("Database tables created");
    await initializeDatabase();
  })
  .catch((err) => {
    console.error("Unable to connect: ", err);
  });

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected successfully to the database");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

testConnection();

app.use("/api/category", categoryRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", authRoutes); 
app.use("/api/review", reviewRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/manage-user", userRoutes);
app.use("/api/following", followingRoutes);
app.use("/api/auth", socialLoginRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/subscription-order", subscriptionOrderRoutes);
app.use("/api/sales/books", salesReport);
app.use("/api/levels", levels);
app.use("/api/account", accountRoute);
app.use("/api/comm", communicationRoute);
app.use("/api/notification", notificationRoutes);
app.use("/api/promotion", promoRoute);
app.use("/api/sold-report", soldContentRoute);
app.use("/api/role", permissionRoute);
app.use("/api/announcement", announcementRoute);
app.use("/api/subscriptions", subscription);
app.use("/api/quality-guidelines", qaulity);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/review-feedback", reviewRoute);
app.use("/api/user-review", userReview);
app.use("/api/user-activity", userActivity);
app.use("/api/asset-usage", assetUsageRoute);
app.use("/api/sales-man", salesManRoute);
app.use('/api/sales-man-payments', salesmanPaymentRoutes);


app.get("/", (req, res) => {
  res.send("worked");
});

process.on("uncaughtException", (err) => {
  console.log("error", err);
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({ error: "File size exceeds limit!" });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({ error: "Unexpected file field!" });
      default:
        return res.status(400).json({ error: err.message });
    }
  } else if (err) {
    return res.status(500).json({ error: err });
  }
  next();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});
