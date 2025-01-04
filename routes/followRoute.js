
const express = require('express');
const { followUser, getFollowers, getFollowing, getMyFollowers, getMyFollowing } = require('../controllers/followController');
const { verifyUser } = require('../middlewares/auth');
const isTheRoleIsAuthor = require('../middlewares/isUser');
const { isAuthor } = require('../middlewares/author');
const router = express.Router();



router.post('/follow', verifyUser,isTheRoleIsAuthor,followUser);
router.get('/followers/:id', getFollowers);
router.get('/following/:id', getFollowing);
router.get('/myfollowers', verifyUser,isAuthor,getMyFollowers);// to be changed
router.get('/amfollowing', verifyUser,isAuthor,getMyFollowing);

module.exports = router;