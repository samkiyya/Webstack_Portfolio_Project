const { paramsSchema } = require('../helpers/schema');
const  Review = require('../models/ReviewModel'); 

const isOwnerOfTheReview = async (req, res, next) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const reviewId = Number(req.params.id); 
    const userId = req.user.id; 

    try {
      
        const review = await Review.findByPk(reviewId);

       
        if (!review) {
            return res.status(404).json({ success: false, message: 'review not found' });
        }

   
        if (review.user_id !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to perform action on this review' });
        }

        next(); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { isOwnerOfTheReview}