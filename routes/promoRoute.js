
const express = require("express");
const { verifyUser, verifyAdmin } = require("../middlewares/auth");
const { createPromotion, getAllPromotions, getPromotionById, updatePromotion, deletePromotion } = require("../controllers/promoController");
const { promoImage } = require("../middlewares/imageupload");

const router = express.Router()

router.post('/create',verifyAdmin, promoImage.single('image'),  createPromotion );
router.get('/get-all', getAllPromotions);
router.get('/by/:id',verifyAdmin, getPromotionById);
router.put('/update/:id',verifyAdmin, updatePromotion);
router.delete('/delete/:id',verifyAdmin, deletePromotion );


module.exports = router
