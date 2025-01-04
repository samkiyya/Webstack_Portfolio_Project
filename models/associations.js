const User = require("./Usermodel");
const Admin = require("./AdminModel");
const Audio = require("./AudioModel");
const Book = require("./BookModel");
const Category = require("./CategoryModel");
const Following = require("./FollowingModel");
const Review = require("./ReviewModel");
const Notification = require("./NotificationModel");
const Report = require("./ReportModel");
const Promotion = require("./PromotionModel");
const Coupon = require("./CouponModel");
const Subscription = require("./SubscriptionModel");
const SubscriptionOrder = require("./SubscriptionOrderModel");
const SoldContent = require("./SoldContentModel");

const TwoFactorAuth = require("./TwoFactorModel");

const AccountName = require("./AccountModel");
const Communication = require("./CommunicationModel");
const Level = require("./LevelModel");
const Order = require("./OrderModel");
const Permission = require("./permissionModel");

const defineAssociations = () => {
  Category.hasMany(Book, { foreignKey: "category_id", as: "categoryBook" });
  Book.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category",
    onDelete: "SET NULL",
  });

  User.hasMany(Book, { foreignKey: "author_id", as: "book" });
  Book.belongsTo(User, {
    foreignKey: "author_id",
    as: "bookAuthor",
    onDelete: "CASCADE",
  });

  Subscription.hasMany(User, { foreignKey: "subscription_id", as: "users" });
  User.belongsTo(Subscription, {
    foreignKey: "subscription_id",
    as: "subscription",
    onDelete: "SET NULL",
  });

  //User.hasMany(Following, { foreignKey: 'user_id', as: 'followeing',  });
  //Following.belongsTo(User, { foreignKey: 'user_id' , as: 'f-user',  onDelete: 'CASCADE' });
  /* User.belongsToMany(User, { 
    through: Following, 
    as: 'followers', 
    foreignKey: 'followedId', 
    otherKey:'followerId'
  });
   
  User.belongsToMany(User, { 
    through: Following, 
    as:'following', 
    foreignKey:'followerId', 
    otherKey:'followedId'
  }); */
  User.hasMany(Following, { foreignKey: "followed_id", as: "followers" });
  User.hasMany(Following, { foreignKey: "follower_id", as: "following" });
  Following.belongsTo(User, {
    foreignKey: "follower_id",
    as: "followerUser",
    onDelete: "CASCADE",
  });
  Following.belongsTo(User, {
    foreignKey: "followed_id",
    as: "followedUser",
    onDelete: "CASCADE",
  });
  // In Permission model
// In Permission model
Permission.belongsTo(Admin, {
  foreignKey: {
    name: 'userId',
    allowNull: true, // Ensure the foreign key can be null
  },
  as: 'user',
  onDelete: 'SET NULL', // Set userId to null when the associated Admin is deleted
  onUpdate: 'CASCADE',  // Update userId if the Admin's primary key changes
});

// In Admin model
Admin.hasMany(Permission, {
  foreignKey: {
    name: 'userId',
    allowNull: true, // Ensure the foreign key can be null
  },
  as: 'permissions',
});



  Book.hasMany(Audio, { foreignKey: "book_id", as: "audio" });
  Audio.belongsTo(Book, {
    foreignKey: "book_id",
    as: "audioBook",
    onDelete: "CASCADE",
  });

  Book.hasMany(Review, { foreignKey: "book_id", as: "review" });
  Review.belongsTo(Book, { foreignKey: "book_id", as: "reviewBook" });

  Book.hasMany(Order, { foreignKey: "book_id", as: "order" });
  Order.belongsTo(Book, { foreignKey: "book_id", as: "orderBook" });

  User.hasMany(Order, { foreignKey: "user_id", as: "order" });
  Order.belongsTo(User, { foreignKey: "user_id", as: "orderUser" });

  //
  Subscription.hasMany(SubscriptionOrder, {
    foreignKey: "subscription_id",
    as: "subscriptionOrder",
  });
  SubscriptionOrder.belongsTo(Subscription, {
    foreignKey: "subscription_id",
    as: "forSubscription",
  });

  User.hasMany(SubscriptionOrder, {
    foreignKey: "user_id",
    as: "userSubscriptionOrder",
  });
  SubscriptionOrder.belongsTo(User, {
    foreignKey: "user_id",
    as: "subscriptionUser",
  });

  User.hasMany(Review, { foreignKey: "user_id", as: "review" });
  Review.belongsTo(User, {
    foreignKey: "user_id",
    as: "reviewUser",
    onDelete: "CASCADE",
  });

  User.hasMany(Notification, { foreignKey: "user_id", as: "notification" });
  Notification.belongsTo(User, {
    foreignKey: "user_id",
    as: "notificationUser",
    onDelete: "CASCADE",
  });

  Report.belongsTo(User, { foreignKey: "reportedBy", as: "bookAuthor" });
  Report.belongsTo(Review, {
    foreignKey: "reviewId",
    as: "review",
    onDelete: "CASCADE",
  });

  // User.hasMany(Coupon, { foreignKey: 'author_id', as: 'coupon',  });
  //

  Coupon.belongsTo(User, { foreignKey: "user_id", as: "couponUser" });

  Coupon.belongsTo(Book, {
    foreignKey: "book_id",
    as: "couponBook",
    onDelete: "CASCADE",
  });

  SoldContent.belongsTo(Book, { foreignKey: "book_id", as: "soldBook" });
  SoldContent.belongsTo(Order, { foreignKey: "order_id", as: "orderedBook" });

 

  User.hasOne(TwoFactorAuth, { foreignKey: "user_id", as: "twoFactor" });
  TwoFactorAuth.belongsTo(User, {
    foreignKey: "user_id",
    as: "twoFactorUser",
    onDelete: "CASCADE",
  });

  Level.hasMany(User, { foreignKey: "level_id", as: "userLevel" });
  User.belongsTo(Level, { foreignKey: "level_id", as: "levelUser" });

  User.hasMany(Communication, { foreignKey: "author_id", as: "comUser" });
  Communication.belongsTo(User, {
    foreignKey: "author_id",
    as: "comUser",
    onDelete: "CASCADE",
  });

  Book.hasMany(Communication, { foreignKey: "book_id", as: "bookCom" });
  Communication.belongsTo(Book, {
    foreignKey: "book_id",
    as: "comBook",
    onDelete: "CASCADE",
  });
};

module.exports = defineAssociations;
