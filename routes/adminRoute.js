const express = require("express");
const { adminLogin, adminLogout,updateAdmin,updateAdminProfile,deleteAdminById,getAllAdmins, registerAdmin, verifyAdminSession, adminchangePassword, adminForgetPassword, adminResetPassword,  updateRole, getAllModerators, adminProfile, getAdminReferalLink } = require("../controllers/adminController");
const { verifyAdmin } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");

const router = express.Router()


router.get('/logout',verifyAdmin, adminLogout);
router.post('/login', adminLogin);
router.post('/register', registerAdmin);
router.get('/verify', verifyAdmin,verifyAdminSession);
router.get('/get-all-admins', verifyAdmin,isAdmin,getAllAdmins);
router.delete('/delete-admin/:id',verifyAdmin,isAdmin, deleteAdminById);
router.put('/update-account',verifyAdmin, updateAdmin);
router.put('/update-user/:id',updateAdminProfile);
router.put('/update-role/:id',verifyAdmin,isAdmin, updateRole);


router.put('/change-password',verifyAdmin, adminchangePassword);
router.post('/forget-password', adminForgetPassword);
router.post('/reset-password', adminResetPassword);
//router.post('/login2fa', adminLoginWith2fa);
//router.post('/verify2fa', adminVerifyTwoFactorCode);
//router.put('/change-2fa-password',verifyAdmin, adminchange2faPassword);
router.get('/moderators',verifyAdmin, getAllModerators);
router.get('/my-profile',verifyAdmin, adminProfile);
router.get('/my-referal',verifyAdmin, getAdminReferalLink);

module.exports = router

