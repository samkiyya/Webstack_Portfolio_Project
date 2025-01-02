const express = require("express")
const { findCategory, findCategoryById, createCategory, deleteCategory, updateCategory } = require("../controllers/categoryController");
const { verifyAdmin } = require("../middlewares/auth");

const router = express.Router()

router.get('/get-all',findCategory );
router.get('/by/:id',verifyAdmin,findCategoryById );
router.post('/create', verifyAdmin,createCategory);
router.delete('/delete/:id', verifyAdmin,deleteCategory);
router.put('/update/:id', verifyAdmin,updateCategory);

module.exports = router
