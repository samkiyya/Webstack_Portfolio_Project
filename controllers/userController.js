const {
  paramsSchema,
  userSchema,
  updateUserSchema,
} = require("../helpers/schema");
const Admin = require("../models/AdminModel");
const Level = require("../models/LevelModel");
const { createBookNotification } = require("../utils/notificationService");
const Subscription = require("../models/SubscriptionModel");
const SubscriptionOrder = require("../models/SubscriptionOrderModel");
const User = require("../models/Usermodel");
//const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const jwt = require("jsonwebtoken");
const sendVerificationEmail = require("../utils/emailaverification");

const registerUserWithReferal = async (req, res) => {
  const { error } = userSchema.validate(req.body);

  if (error) {
    console.error("Validation error details:", error.details);
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  try {
    const { email, password, fname, lname, phone, city, country, role, bio } =
      req.body;
    //console.log(email, password, fname, lname,phone,role)
    console.log("Request body:", req.body);

    if (!req.file?.path) {
      return res
        .status(400)
        .json({ success: false, error: "Image does not exists." });
    }
    let user;
    user = await User.findOne({ where: { email } });
    if (user) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists. try login" });
    }

    if (phone) {
      const existingUserByPhone = await User.findOne({ where: { phone } });
      if (existingUserByPhone) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Phone number already exists. Please use a different phone number.",
          });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const subscription = await Subscription.findOne({ where: { id: 1 } });
    user = await User.create({
      email,
      password: hashedPassword,
      imageFilePath: req.file.path,
      fname,
      lname,
      phone,
      role,
      city,
      country,
      bio,
      level_id: 1,
    });
    const referalCode = `user-${user.fname}-${Date.now()}`;

    const currentDate = new Date();
    user.subscription_id = subscription.id;
    user.referalCode = referalCode;

    user.expirationDate = new Date(
      currentDate.setFullYear(currentDate.getFullYear() + 1)
    );
    await user.save();
    orderNumber = `subOrder-${Date.now()}`;

    await SubscriptionOrder.create({
      user_id: user.id,
      totalPrice: subscription.price,
      receiptImage: "No image",
      subscription_id: subscription.id,
      subscriptionType: "Yearly",
      status: "APPROVED",
      reviewedBy: "Default",
      orderNumber,
    });

    try {
      const tempPoint = 100;
      if (req.referal?.role === "AUTHOR" || req.referal?.role === "USER") {
        let referal_user = await User.findByPk(Number(req.referal.id));
        referal_user.userInvited++;
        await createBookNotification(
          {
            title: "New User Registered by your invitation code",

            description: `Hello ${referal_user?.fname}, you have received ${tempPoint} points from your user invitation code. ${user?.fname} ${user?.lname} registered using your invitation code `,
          },
          referal_user.id
        );
        if (parseInt(referal_user.point) < 9) {
          referal_user.point = parseInt(referal_user.point) + tempPoint;
          await referal_user.save();
          console.log(referal_user.point, "hhhhh");
        } //point
        if (parseInt(referal_user.point) >= 10) {
          const nextLevel = parseInt(referal_user.level_id) + 1;
          const level = await Level.findByPk(nextLevel);
          if (level) {
            referal_user.level_id = level.id;
            referal_user.point = 0;
            await referal_user.save();
          } else {
            referal_user.point = parseInt(referal_user.point) + tempPoint;
            await referal_user.save();
          }
        } //mypoint
        await referal_user.save();
      } //abbb
      if (req.referal?.role === "ADMIN" || req.referal?.role === "MODERATOR") {
        let referal_admin = await Admin.findByPk(Number(req.referal?.id));
        referal_admin.userInvited++;

        referal_admin.save();
      } //admin
    } catch (err) {
      console.log("Error", err);
    }

    const token = jwt.sign(
      { id: user.id, fname: user.fname },
      process.env.JWT_EMAIL_SECRET,
      { expiresIn: "3h" }
    );
    await sendVerificationEmail(user.email, user.fname, token);

    return res
      .status(201)
      .json({
        success: true,
        message:
          "User registered successfully!. we have sent a verification link to your email. Please verify your email",
      });
  } catch (error) {
    res.status(500).json({ success: false, me: "kkk", error: error.message });
  }
};

const getUserReferalLink = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const referalLink = `${process.env.REACT_APP_URL}/referal/${user.referalCode}`;
    res.status(200).json({ success: true, referalLink });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password"],
      },
    });
    res.status(200).json({ success: true, users });
  } catch (error) {
    // console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const id = Number(req.params.id);
    const user = await User.findOne({
      attributes: {
        exclude: ["password"],
      },
      where: { id },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMyAccount = async (req, res) => {
  const { error } = updateUserSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const userId = req.user.id;
  const { fname, lname, phone, bio, city, country } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.fname = fname !== undefined ? fname : user.fname;
    user.lname = lname !== undefined ? lname : user.lname;
    user.phone = phone !== undefined ? phone : user.phone;

    user.bio = bio !== undefined ? bio : user.bio;
    user.city = city !== undefined ? city : user.city;
    user.country = country !== undefined ? country : user.country;

    console.log(req.file);
    if (req.file?.path) {
      console.log(user.imageFilePath);
      const imagePath = path.join(__dirname, "..", user.imageFilePath);

      try {
        await fs.access(imagePath);
        await fs.unlink(imagePath);
        user.imageFilePath = req.file.path;
        console.log(`Deleted image file: ${imagePath}`);
      } catch (err) {
        console.error(`Error handling image file: ${err.message}`);
      }
    }

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating user", error });
  }
};

const deleteMyAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const imagePath = path.join(__dirname, "..", user.imageFilePath);

    try {
      await fs.access(imagePath);
      await fs.unlink(imagePath);
      console.log(`Deleted audio file: ${imagePath}`);
    } catch (err) {
      console.error(`Error handling audio file: ${err.message}`);
    }

    await User.destroy({ where: { id: userId } });

    return res
      .status(204)
      .send({ success: false, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting user", error });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateMyAccount,
  deleteMyAccount,
  registerUserWithReferal,
  getUserReferalLink,
};
