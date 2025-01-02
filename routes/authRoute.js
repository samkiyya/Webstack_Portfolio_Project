const express = require("express");
const { registerUser, userLogin, userLogout, verifyUserSession, verifyTwoFactorCode, verifyUserAccountFromEmail, changePassword, userForgetPassword, userResetPassword, sendMeVerificationEmail, toggleTwoFactorAuth, userprofile } = require("../controllers/authController");
const { verifyUser } = require("../middlewares/auth");
const { userUpload } = require("../middlewares/imageupload");
//const { checkDuplicateUser } = require("../middlewares/duplicateChecker");


const router = express.Router()

router.post('/register',userUpload.single('image'), registerUser);
router.post('/login', userLogin);
router.post('/logout',verifyUser, userLogout);
router.get('/verify', verifyUser, verifyUserSession);
router.post('/verify/2fa', verifyTwoFactorCode);
router.post('/verify/account/:token', verifyUserAccountFromEmail);
router.post('/change-password', verifyUser, changePassword );
router.post('/forgot-password', userForgetPassword );
router.post('/reset-password/:token', userResetPassword );
router.post('/sendme-verification-email', sendMeVerificationEmail );
router.post('/toggle/2fa',verifyUser, toggleTwoFactorAuth );
router.get('/my-profile', verifyUser,userprofile );
//router.post('/checklevel',checkme);



module.exports = router
