
const express = require("express");
const { verifyUser, verifyAdmin } = require("../middlewares/auth");
const { createCommunication, getAllCommunications, getCommunicationById, updateCommunication, deleteCommunication, notAgreedCommunication, getLoggedInAuthorcommunications, isAgreed, isNotAgreed } = require("../controllers/communicationController");

const router = express.Router()

router.post('/create',verifyAdmin , createCommunication);
router.post('/propose',verifyUser , createCommunication);
router.get('/get-all',  verifyAdmin,   getAllCommunications);
router.get('/by/:id',verifyAdmin, getCommunicationById);
router.put('/update/:id', verifyAdmin,   updateCommunication);
router.delete('/delete-from-user/:id',verifyUser, deleteCommunication );
router.delete('/delete/:id',verifyAdmin, deleteCommunication );
router.get('/notagreed',  verifyAdmin, notAgreedCommunication );
router.get('/logged-author', verifyUser,  getLoggedInAuthorcommunications );

router.put('/change-agreement/:id', verifyUser, isNotAgreed  );

module.exports = router
