
const { paramsSchema } = require('../helpers/schema');
const Book = require('../models/BookModel');
const Order = require('../models/OrderModel');
const Subscription = require('../models/SubscriptionModel');



const isPaidForBook = async (req, res, next) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const userId = req.user.id; 
    const bookId = Number(req.params.id); 

    try {
        const user = await Order.findOne({
            where:{
                book_id:bookId ,
                user_id: userId,
                status: 'APPROVED',
            },
            });

        if (!user) {
            return res.status(404).json({ success: false, message: 'No order found for this user' });
        }

       

        next(); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


const isOrderBefore = async (req, res, next) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const userId = req.user.id; 
    const bookId = Number(req.params.id); 

    try {

        const book = await Book.findByPk(bookId);

              if (!book) {
                  return res.status(404).json({ success: false, message: 'Book not found' });
              }

        const order = await Order.findOne({
            where:{
                book_id:bookId ,
                user_id: userId,  }, });

        
            if (order) {
                return res.status(400).json({ success: false, message: 'You have ordered this book before..' });
            }  

       
         req.book = book
        next(); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const checkSubOrder =async (req,res, next)=>{
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const {id}= req.params


   try{
       const subscription = await Subscription.findByPk(id);
           
       if (!subscription) {
           return res.status(404).json({success: false, message: 'Subscription plan not found' });
       }

       req.subscription = subscription;
       next();


   }
   catch(error){
    return res.status(500).json({ success: false, message: 'Internal server error' });

   }

}



module.exports = { isPaidForBook, isOrderBefore,checkSubOrder}