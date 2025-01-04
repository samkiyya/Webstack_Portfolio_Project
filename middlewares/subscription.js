
const User = require('../models/Usermodel');
const Subscription = require('../models/SubscriptionModel');


const checkSubscriptionLimit = async (req, res, next) => {
    const userId = req.user.id; 

    try {
      
        const user = await User.findOne({
            where: { id: userId },
            include: [{
                model: Subscription,
                as: 'subscription', 
            }],
        });

        if (!user || !user.expirationDate) {
            return res.status(403).json({ message: 'No active subscription found.' });
        }

        const currentDate = new Date();

     
        if (user.expirationDate < currentDate) {
            return res.status(403).json({ message: 'Your subscription has expired. Please renew to access this resource.' });
        }

        const limitCount =user.subscription.limitCount

        let currentUsage;
        
        if (req.user.role === 'AUTHOR') { 
            currentUsage = user.postLimitCount; 
           // console.log(currentUsage, limitCount)
            if (currentUsage > limitCount) {
                return res.status(402).json({ message: 'Post limit reached. Please upgrade your subscription.' });
            }
         

            
        } else if (req.user.role === 'USER' ) {
            currentUsage = user.orderLimitCount; 
            if (currentUsage >= limitCount) {
                return res.status(402).json({ message: 'Order limit reached. Please upgrade your subscription.' });
            }
        }
     
        next(); 
    } catch (error) {
    
        res.status(500).json({ message: 'Error checking subscription limit', error });
    }
};



module.exports = checkSubscriptionLimit;