
const { followSchema, paramsSchema } = require('../helpers/schema');
const Following = require('../models/FollowingModel')
const User = require('../models/Usermodel')

const followUser = async (req, res) => {
    const { error } = followSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const follower_id = req.user.id; 
    const followed_id = req.body.user_id;

    try {
        const followRelationship = await Following.findOne({
            where: { follower_id, followed_id }
        });

        if (followRelationship) {
            // Unfollow if the relationship exists
            await followRelationship.destroy();
            return res.status(200).json({ message: 'You have unfollowed this user.' });
        }

        // Follow if the relationship does not exist
        await Following.create({ follower_id, followed_id });
        res.status(201).json({ message: 'You are now following this user.' });

    } catch (error) {
        res.status(500).json({ error });
    }
};




const getFollowers = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
  
    const userId = Number(req.params.id);

    try {
        const {count, rows:followers} = await Following.findAndCountAll({
            where:{ followed_id:userId },
            include: [{
                model: User,
                as:'followerUser',
                attributes: ['id','fname','lname','imageFilePath','email',]
            }]
        });

       res.status(200).json({success:true, count,followers});
        
   } catch (error) {
       res.status(500).json({ error });
   }
};

const getMyFollowers = async (req, res) => {
    const userId = req.user.id; 

    try {
        const {count, rows:followers} = await Following.findAndCountAll({
            where:{ followed_id:userId },
            include: [{
                model: User,
                as:'followerUser',
                attributes: ['id','fname','lname','imageFilePath','email',]
            }]
        });

       res.status(200).json({success:true, count,followers});
        
   } catch (error) {
       res.status(500).json({ error });
   }
};


const getFollowing = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
  
   const userId = Number(req.params.id);

   try {
       const {count, rows: followingUsers} = await Following.findAndCountAll({
        where:{ follower_id:userId },
           include:[{
               model : User,
               as:'followedUser',
               attributes: ['id','fname','lname','imageFilePath','email',]
               
           }]
       });

       res.status(200).json({success:true, count,followingUsers});
       
   } catch (error) {
       res.status(500).json({ error });
   }
};
const getMyFollowing = async (req, res) => {
    const userId = req.user.id; 
 
    try {
        const {count, rows:followingUsers} = await Following.findAndCountAll({
            where:{ follower_id:userId },
            include:[{
                model : User,
                as:'followedUser',
                attributes: ['id','fname','lname','imageFilePath','email',]
            }]
        });
 
        res.status(200).json({success:true, count,followingUsers});
        
    } catch (error) {
        res.status(500).json({ error });
    }
 };



module.exports = {
    followUser,
    getFollowers,
    getFollowing,
    getMyFollowers,
    getMyFollowing
}