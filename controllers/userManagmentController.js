const {
  paramsSchema,
  providerParamsSchema,
  isActiveSchema,
  userRoleSchema,
  authorQuerySchema,
  emailSchema,
} = require("../helpers/schema");
const User = require("../models/Usermodel");
const Book = require("../models/BookModel");
const Following = require("../models/FollowingModel");
const sendEmailtoUser = require("../utils/emailwithcontent");
const { Op } = require('sequelize');

const fetchAuthorWithFiltersFromUser = async (req, res) => {
  const { error } = authorQuerySchema.validate(req.query);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { page = 1, size = 10, fname, lname, sortBy } = req.query;
  const { postCount } = req.body;

  try {
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    let whereCondition = {
      role: "AUTHOR",
      isActive: true,
      isVerified: true,
    };

    if (isNaN(limit) || isNaN(offset)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pagination parameters." });
    }

    if (fname) {
      whereCondition.fname = { [Op.like]: `%${fname}%` };
    }

    if (lname) {
      whereCondition.lname = { [Op.like]: `%${lname}%` };
    }

    if (postCount) {
      whereCondition.postCount = { [Op.gte]: postCount };
    }

    let order;
    if (sortBy === "fnameAsc") {
      order = [["fname", "ASC"]];
    } else if (sortBy === "fnameDesc") {
      order = [["fname", "DESC"]];
    } else {
      order = [["createdAt", "DESC"]];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      attributes: {
        exclude: [
          "password",
          "subscription_id",
          "orderCount",
          "postCount",
          "isTwoStepOn",
          "isVerified",
          "referalCode",
          "isActive",
        ],
      },
      limit,
      offset,
      order,
      include: [
        {
          model: Book,
          as: "book",
          attributes: [
            "id",
            "title",
            "description",
            "publicationYear",
            "language",
            "price",
            "audio_price",
            "rating",
            "rateCount",
            "pages",
            "sold",
            "status",
          ], // Include book details in the response
        },
        {
          model: Following,
          as: "followers",
          attributes: [],
          where: { followed_id: { [Op.col]: "User.id" } },
          required: false, // Join should be optional
        },
        {
          model: Following,
          as: "following",
          attributes: [],
          where: { follower_id: req.user.id, followed_id: { [Op.col]: "User.id" } },
          required: false, // Join should be optional
        },
      ],
      subQuery: false, // Prevents the subquery for the count
    });

    const totalPages = Math.ceil(count / limit);

    // Format the result for each author
    const authorsWithDetails = rows.map((author) => {
      // Count the number of books for the author
      const bookCount = author.book.length;

      // Check if the current user is following the author
      const isFollowing = author.following.length > 0;

      // Count the number of followers for the author
      const followerCount = author.followers.length;

      return {
        id: author.id,
        name: `${author.fname} ${author.lname}`,
        bio: author.bio,
        image: author.imageFilePath,
        email: author.email,
        phone: author.phone,
        isVerified: author.isVerified,
        followerCount,
        isFollowing,
        bookCount, // Adding the count of books
        books: author.book.map((book) => ({
          id: book.id,
          title: book.title,
          description: book.description,
          publicationYear: book.publicationYear,
          language: book.language,
          price: book.price,
          audio_price: book.audio_price,
          rating: book.rating,
          rateCount: book.rateCount,
          pages: book.pages,
          sold: book.sold,
          status: book.status,
        })), // Adding book details
      };
    });

    res.status(200).json({
      totalUsers: count,
      users: authorsWithDetails,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching authors",
      error: error.message,
    });
  }
};


const getNotActiveUsers = async (req, res) => {
  try {
    const { count, rows: notActiveUsers } = await User.findAndCountAll({
      where: { isActive: false },
    });

    res.status(200).json({ success: true, count, users: notActiveUsers });
  } catch (error) {
    console.error("Error fetching not active users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getNotVerifiedUsers = async (req, res) => {
  try {
    const { count, rows: notVerifiedUsers } = await User.findAndCountAll({
      where: { isVerified: false },
    });

    res.status(200).json({ success: true, count, users: notVerifiedUsers });
  } catch (error) {
    console.error("Error fetching not verified users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const { error: bodyError } = userRoleSchema.validate(req.body);

  if (bodyError) {
    return res
      .status(400)
      .json({ success: false, message: bodyError.details[0].message });
  }

  const { id } = req.params;
  const { role } = req.body;

  try {
    let updated;
    updated = await User.findOne({ where: { id: Number(id) } });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    updated.role = role !== undefined ? role : updated.role;

    await updated.save();

    res
      .status(200)
      .json({ success: true, message: "User role updated successfully." });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserActiveStatus = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { id } = req.params;

  try {
    let updated;
    updated = await User.findOne({ where: { id: Number(id) } });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    updated.isActive = !updated.isActive ? true : false;

    await updated.save();

    res.status(200).json({ success: true, isActive: updated.isActive });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserByProvider = async (req, res) => {
  const { error } = providerParamsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const { provider } = req.params;

  try {
    const { count, rows: user } = await User.findAndCountAll({
      where: { provider },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, count, user });
  } catch (error) {
    console.error("Error fetching user by provider:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAuthorById = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const author = await User.findOne({
      where: { id: userId, role: "AUTHOR" },
      attributes: [
        "id",
        "fname",
        "lname",
        "bio",
        "imageFilePath",
        "email",
        "phone",
        "isVerified",
      ],
      include: [
        {
          model: Book,
          as: "book",
          attributes: [
            "id",
            "title",
            "description",
            "publicationYear",
            "language",
            "price",
            "audio_price",
            "rating",
            "rateCount",
            "pages",
            "sold",
            "status",
          ],
        },
      ],
    });

    if (!author) {
      return res
        .status(404)
        .json({ message: "Author not found or user is not an author." });
    }

    // Count the followers of the author
    const { count } = await Following.findAndCountAll({
      where: { followed_id: userId },
    });

    // Check if the current user is following the author
    const isFollowing = await Following.findOne({
      where: { follower_id: currentUserId, followed_id: userId },
    });

    res.status(200).json({
      message: "Author details retrieved successfully.",
      author: {
        id: author.id,
        name: `${author.fname} ${author.lname}`,
        bio: author.bio,
        image: author.imageFilePath,
        email: author.email,
        phone: author.phone,
        isVerified: author.isVerified,
        followerCount: count,
        isFollowing: !!isFollowing,
        books: author.book,
      },
    });
  } catch (error) {
    console.error("Error fetching author details:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const sendEmailToUser = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const { error: bodyError } = emailSchema.validate(req.body);

  if (bodyError) {
    return res
      .status(400)
      .json({ success: false, message: bodyError.details[0].message });
  }
  const { id } = req.params;
  const adminName = req.user.fname;
  const { subject, text } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    console.log(req.user);

    const { success, error: emailError } = await sendEmailtoUser(
      user.email,
      adminName,
      subject,
      user.fname,
      text
    );
    if (emailError) {
      return res
        .status(404)
        .json({ success: false, message: `email not sent ${user.fname}` });
    }

    res.status(200).json({
      success: true,
      message: "Email sent successfully.",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  fetchAuthorWithFiltersFromUser,
  updateUserActiveStatus,
  getNotActiveUsers,
  getNotVerifiedUsers,
  updateUserRole,
  getUserByProvider,
  sendEmailToUser,
  getAuthorById,
};
