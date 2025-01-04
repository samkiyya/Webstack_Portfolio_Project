const express = require("express");
const { verifyUser, verifyAdmin } = require("../middlewares/auth");
const { createReview, updateReview,updateStatus, deleteReview, getReviewById, getAllReviews, fetchUserReviewdWithBooks, fetchReviewsForBook } = require("../controllers/reviewController");
const { isOwnerOfTheReview } = require("../middlewares/review");
const { isPaidForBook } = require("../middlewares/payment");

const router = express.Router()

router.post('/create/:id', verifyUser, createReview);
router.put('/update/:id', verifyUser,isOwnerOfTheReview,updateReview);
router.get('/get-all', getAllReviews);
router.delete('/delete/:id', verifyUser,isOwnerOfTheReview,deleteReview);

router.get('/by-userid/:id', verifyAdmin,fetchUserReviewdWithBooks);
router.get('/by-bookid/:id',fetchReviewsForBook);
router.get('/by/:id', verifyAdmin,getReviewById);
router.put('/update-status/:id', verifyAdmin,updateStatus);

module.exports = router
