  
const express = require("express");
const { verifyUser, verifyAdmin } = require("../middlewares/auth");
const { createLevel, getAllLevels, getLevelById, updateLevel, deleteLevel } = require("../controllers/levelController");

const router = express.Router()

router.post('/create' ,createLevel);
router.get('/get-all', verifyAdmin,getAllLevels);
router.get('/by/:id',getLevelById);
router.put('/update/:id',verifyAdmin,updateLevel);
router.delete('/delete/:id',verifyAdmin,deleteLevel );

module.exports = router
