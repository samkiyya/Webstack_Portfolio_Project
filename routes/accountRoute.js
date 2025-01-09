const express = require("express");
const { createAccountName, getAllAccountNames, getAccountNameById, updateAccountName, deleteAccountName } = require("../controllers/accountController");
const { verifyAdmin } = require("../middlewares/auth");



const router = express.Router()

router.post('/create',  verifyAdmin,   createAccountName);
router.get('/get-all', getAllAccountNames );
router.get('/by/:id',verifyAdmin, getAccountNameById);
router.put('/update/:id', verifyAdmin,   updateAccountName );
router.delete('/delete/:id',verifyAdmin,   deleteAccountName );

module.exports = router
