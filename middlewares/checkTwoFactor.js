const User = require("../models/Usermodel");

const checkTwoFactorEnabled = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }
  if (userRole === "admin") {
    res.redirect("/admin/dashboard");
  }

  return next();
};
module.exports = checkTwoFactorEnabled;
