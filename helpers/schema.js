const Joi = require("joi");

const paramsSchema = Joi.object({
  id: Joi.number().integer().min(0).required(),
});

const accountSchema = Joi.object({
  name: Joi.string().min(3).max(30).trim().required(),
  number: Joi.string().min(7).max(30).trim().required(),
});

const adminRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(25).required(),
  fname: Joi.string().min(3).max(20).trim().required(),
  lname: Joi.string().min(3).max(20).trim().required(),
  // twoStepPassword: Joi.string().min(3).max(20).required(),
  role: Joi.string().valid("ADMIN", "MODERATOR").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const filterQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  size: Joi.number().integer().min(1).max(20).default(10).optional(),
  fname: Joi.string().optional(),
  lname: Joi.string().optional(),
  sortBy: Joi.string()
    .valid(
      "fnameAsc",
      "fnameDesc",
      "levelAsc",
      "levelDesc",
      "userInvitedAsc",
      "userInvitedDesc"
    )
    .optional(),
  point: Joi.number().integer().optional(),
  userInvited: Joi.number().integer().optional(),
  referalCode: Joi.string().optional(),
  isTwoStepOn: Joi.boolean().optional(),
  country: Joi.string().optional(),
  city: Joi.string().optional(),
  role: Joi.string().valid("USER", "AUTHOR").optional(),
});

const filterBodySchema = Joi.object({
  orderCount: Joi.number().integer().optional(),
  postCount: Joi.number().integer().optional(),
  isActive: Joi.boolean().optional(),
  isVerified: Joi.boolean().optional(),
  last7days: Joi.boolean().optional(),
  provider: Joi.string().optional(),
});

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string()
    .min(10)
    .max(13)
    .pattern(/^\+?[0-9]+$/)
    .optional(),
  password: Joi.string().min(6).max(25).required(),
  fname: Joi.string().min(2).max(20).trim().required(),
  lname: Joi.string().min(2).max(20).trim().required(),
  bio: Joi.string().min(2).max(30).optional(),
  country: Joi.string().optional(),
  city: Joi.string().trim().optional(),
  role: Joi.string()
    .valid("USER", "AUTHOR", "SALES")
    .default("USER")
    .optional(),
});

const twoStepSchema = Joi.object({
  verificationCode: Joi.string().required(),
  user_id: Joi.number().integer().min(1).required(),
});

const updateAdminSchema = Joi.object({
  fname: Joi.string().min(2).max(20).trim().optional(),
  lname: Joi.string().min(2).max(20).trim().optional(),
});

const updateUserSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^[0-9]+$/)
    .optional(),

  fname: Joi.string().min(2).max(20).trim().optional(),
  lname: Joi.string().min(2).max(20).trim().optional(),
  bio: Joi.string().min(4).max(30).trim().optional(),
  country: Joi.string().optional(),
  city: Joi.string().trim().optional(),
});

const adminTwoStepSchema = Joi.object({
  twoStepPassword: Joi.string().required(),
  brandoToken: Joi.string().required(),
});

const tokenParamsSchema = Joi.object({
  token: Joi.string().required(),
});
const passwordSchema = Joi.object({
  password: Joi.string().min(6).max(25).trim().required(),
});
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(25).trim().required(),
});
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const dayBetweenSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
});

const statusParamsSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "PROCESSING", "APPROVED", "REJECTED")
    .required(),
});

const bookFilterQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  size: Joi.number().integer().min(1).max(20).default(10).optional(),
  title: Joi.string().trim().optional(),
  author: Joi.string().trim().optional(),
  category: Joi.string().optional(),
  sortBy: Joi.string()
    .valid(
      "ratingAsc",
      "ratingDesc",
      "rateCountAsc",
      "rateCountDesc",
      "mostSold",
      "leastSold",
      "priceAsc",
      "priceDesc"
    )
    .optional(),
  publicationYear: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  language: Joi.string().optional(),
  minPrice: Joi.number().precision(2).optional(),
  maxPrice: Joi.number().precision(2).optional(),
});

const bookCreationSchema = Joi.object({
  title: Joi.string().min(3).max(30).required(),
  author: Joi.string().min(3).max(20).required(),
  description: Joi.string().min(7).max(100).required(),
  category_id: Joi.number().integer().min(1).required(),
  language: Joi.string().min(2).max(30).required(),
  pages: Joi.number().integer().min(5).required(),
  price: Joi.number().positive().required(),
  publicationYear: Joi.number()

    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required(),
});

const categorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
});

const communicationSchema = Joi.object({
  message: Joi.string().required(),
  serviceCharge: Joi.number().min(0).max(100).optional().default(0),
  reviewedBy: Joi.string().optional(),
  isAgreed: Joi.boolean().optional().default(false),
  // author_id: Joi.number().integer().min(1).required(),
  book_id: Joi.number().integer().min(1).required(),
});
const communicationUpdateSchema = Joi.object({
  book_id: Joi.number().integer().min(1).required(),
  message: Joi.string().required(),
  serviceCharge: Joi.number().min(0).max(100).optional().default(0),
});

const followSchema = Joi.object({
  user_id: Joi.number().integer().min(1).required(),
});

const audioSchema = Joi.object({
  episode: Joi.string().required(),
});

const orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "PROCESSING", "APPROVED", "CANCELLED")
    .required(),
});

const orderNumberSchema = Joi.object({
  orderNumber: Joi.string().required(),
});

const placeOrderSchema = Joi.object({
  // book_id: Joi.number().integer().min(1).required(),
  bankName: Joi.string().min(3).required(),
  transactionNumber: Joi.string().min(5).required(),
});

const promotionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  url: Joi.string().uri().optional(),
});
const reviewSchema = Joi.object({
  comment: Joi.string().required(),
  reviewRating: Joi.number().integer().min(1).max(5).required().default(0),
});

const subsOrderSchema = Joi.object({
  //price: Joi.number().greater(0).required(),
  subscriptionType: Joi.string().valid("Monthly", "Yearly").required(),
  reviewedBy: Joi.string().optional(),
  // subscription_id: Joi.number().integer().min(1).required(),
});

const subscriptionSchema = Joi.object({
  name: Joi.string().required().max(25),
  limitCount: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required(),
});

const providerParamsSchema = Joi.object({
  provider: Joi.string().required(),
});
const emailSchema = Joi.object({
  subject: Joi.string().required(),
  text: Joi.string().required(),
});
const isActiveSchema = Joi.object({
  isActive: Joi.boolean().optional(),
});
const userRoleSchema = Joi.object({
  role: Joi.string().valid("USER", "AUTHOR").optional(),
});
const adminRoleSchema = Joi.object({
  role: Joi.string().valid("ADMIN", "MODERATOR").optional(),
});

const authorQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  size: Joi.number().integer().min(1).max(20).default(10).optional(),
  fname: Joi.string().optional(),
  lname: Joi.string().optional(),
  sortBy: Joi.string().valid("fnameAsc", "fnameDesc").optional(),
});
const audioIDSchema = Joi.object({
  audio_id: Joi.number().integer().min(0).required(),
});

//codes add for notification management by sami
const notificationSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  body: Joi.string().min(10).max(500).required(),
  type: Joi.string().valid("BOOK", "ANNOUNCEMENT").required(),
  user_id: Joi.number().integer().required(),
});

const notificationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  size: Joi.number().integer().min(1).max(20).default(10).optional(),
  type: Joi.string().valid("BOOK", "ANNOUNCEMENT").optional(),
  isRead: Joi.boolean().optional(),
});

const notificationParamsSchema = Joi.object({
  id: Joi.number().integer().min(0).required(),
});

module.exports = {
  passwordSchema,
  placeOrderSchema,
  audioIDSchema,
  audioSchema,
  updateAdminSchema,
  updateUserSchema,
  adminRoleSchema,
  adminTwoStepSchema,
  paramsSchema,
  accountSchema,
  adminRegistrationSchema,
  loginSchema,
  filterQuerySchema,
  filterBodySchema,
  userSchema,
  twoStepSchema,
  tokenParamsSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  dayBetweenSchema,
  statusParamsSchema,
  bookFilterQuerySchema,
  bookCreationSchema,
  categorySchema,
  communicationSchema,
  communicationUpdateSchema,
  followSchema,
  orderStatusSchema,
  orderNumberSchema,
  promotionSchema,
  reviewSchema,
  subsOrderSchema,
  subscriptionSchema,
  providerParamsSchema,
  isActiveSchema,
  userRoleSchema,
  authorQuerySchema,
  emailSchema,

  //notification related exports
  notificationSchema,
  notificationQuerySchema,
  notificationParamsSchema,
};

//deviceInfo: Joi.string().optional(),
// price: Joi.number().positive().optional(), order: Joi.string().valid('asc', 'desc').optional(),
