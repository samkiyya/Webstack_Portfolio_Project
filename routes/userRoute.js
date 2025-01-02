const express = require("express");
const { checkReferalCode } = require("../middlewares/account");
const { registerUserWithReferal,  getAllUsers, getUserById, getUserReferalLink, deleteMyAccount, updateMyAccount } = require("../controllers/userController");
const { verifyUser, verifyAdmin } = require("../middlewares/auth");
const {  userUpload } = require("../middlewares/imageupload");
const { fetchAuthorWithFiltersFromUser, updateUserActiveStatus, getNotActiveUsers, getNotVerifiedUsers, updateUserRole, getUserByProvider, sendEmailToUser,getAuthorById } = require("../controllers/userManagmentController");
const { fetchUsersWithFiltersFromAdmin } = require("../controllers/appController");

const router = express.Router()


router.post('/register-byreferal/:token',checkReferalCode ,userUpload.single('image'), registerUserWithReferal);
router.put('/update-my-account', verifyUser,userUpload.single('image'),updateMyAccount);
router.get('/get-all-users',getAllUsers );
router.get('/my-referal',verifyUser,getUserReferalLink);
router.delete('/delete-my-account', verifyUser,deleteMyAccount);
router.get('/filter-authors',verifyUser, fetchAuthorWithFiltersFromUser);
router.get('/filter-allusers', verifyAdmin,fetchUsersWithFiltersFromAdmin);

router.put('/toggle/isactive/:id', verifyAdmin,updateUserActiveStatus);
router.get('/not-active-users', verifyAdmin,getNotActiveUsers);
router.get('/verified-users', verifyAdmin,getNotVerifiedUsers);
router.put('/change-role/:id', verifyAdmin,updateUserRole);
router.get('/provider/:provider', verifyAdmin,   getUserByProvider);
router.post('/send-email/:id', verifyAdmin,   sendEmailToUser);
router.get('/get-user/:id',verifyAdmin, getUserById);

router.get('/get-author/:userId',verifyUser, getAuthorById);


module.exports = router
