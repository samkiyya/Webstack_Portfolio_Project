const  Review  = require('../models/ReviewModel'); 
const  Book  = require('../models/BookModel'); 
const { paramsSchema, reviewSchema } = require('../helpers/schema');
const User = require('../models/Usermodel');

const createReview = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { error: bodyError } = reviewSchema.validate(req.body);

    if (bodyError) {
        return res.status(400).json({ success: false, message: bodyError.details[0].message });
    }
    
   
    const { comment, rating } = req.body;
    const userId = req.user.id; 
    const bookId = Number(req.params.id); 

    try {
        
        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({success: false, message: 'Book not found' });
        }

        if (book.author_id == userId) {
            return res.status(403).json({success: false, message: 'You can not review your own book' });
        }

        let review 
        review= await Review.findOne({
            where: { user_id: userId, book_id: bookId}
        })

       
        if(review) {
            return res.status(400).json({success: false, message: 'You have reviewed this book before.' });
        }
        review = await Review.create({
            comment,
            reviewRating: rating,
            user_id: userId,
            book_id: bookId,
        });
        book.rating = ((book.rating * book.rateCount + rating) / (book.rateCount + 1)).toFixed(1);  // (5*0 + 3) / (2+1) = 3 
        book.rateCount++;
        await book.save();

        return res.status(201).json({success: true, message: 'Your reviewed this book successfully ', review });
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: 'Error creating review', error });
    }
};



const updateReview = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { comment, rating, book_id } = req.body;
    const userId = req.user.id; 
    const reviewId = Number(req.params.id); 

    try {
        
        const book = await Book.findByPk(book_id);
        if (!book) {
            return res.status(404).json({success: false, message: 'Book not found' });
        }

        
        let review 
        review= await Review.findOne({
            where: { user_id: userId, id: reviewId}
        })

       
        if(!review) {
            return res.status(400).json({success: false, message: 'Review not found' });
        }
         
        review.comment = comment !== undefined ? comment : review.comment;
        review.reviewRating = rating !== undefined ? rating : review.reviewRating;

        await review.save();

        
        book.rating = ((book.rating * book.rateCount + rating) / (book.rateCount + 1)).toFixed(1);  // (5*0 + 3) / (2+1) = 3 
       
        await book.save();

        return res.status(201).json({success: true, message: 'You edited the review of this book successfully ', review });
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: 'Error creating review', error });
    }
};

const updateStatus = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { status } = req.body;
   
    const reviewId = Number(req.params.id); 

    try {
        
       

        
        let review 
        review= await Review.findOne({
            where: {  id: reviewId}
        })

       
        if(!review) {
            return res.status(400).json({success: false, message: 'Review not found' });
        }
         
        review.status = status !== undefined ? status : review.status;
    

        await review.save();

        

        return res.status(201).json({success: true, message: 'You edited the review of this book successfully ', review });
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: 'Error creating review', error });
    }
};



const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                {
                    model: Book,
                    as: 'reviewBook',  // Association alias for Book
                    attributes: ['id', 'title', 'author', 'language', 'publicationYear', 'price'],  // Specify the fields you want to include from the Book model
                },
                {
                    model: User,
                    as: 'reviewUser',  // Association alias for User
                    attributes: ['id', 'fname', 'email'],  // Specify the fields you want to include from the User model
                }
            ]
        });

        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error retrieving reviews', error });
    }
};



const getReviewById = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const reviewId = Number(req.params.id);  
    try {
        const review = await Review.findOne({
            where:{ id: reviewId },
            include: [
                {
                    model: Book,
                    as: 'reviewBook',  // Association alias for Book
                    attributes: ['id', 'title', 'author', 'language', 'publicationYear', 'price'],  // Specify the fields you want to include from the Book model
                },
                {
                    model: User,
                    as: 'reviewUser',  // Association alias for User
                    attributes: ['id', 'fname', 'email'],  // Specify the fields you want to include from the User model
                }
            ]
            


            });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        return res.status(200).json(review);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving review', error });
    }
};


const deleteReview = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const reviewId = Number(req.params.id);


    try {
        const deletedCount = await Review.destroy({ where: { id: reviewId } });
        if (deletedCount === 0) {
            return res.status(404).json({success: false, message: 'Review not found' });
        }
        return res.status(204).send({ success: true, message: 'Review deleted successfully' }); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false,message: 'Error deleting review', error });
    }
};

const fetchUserReviewdWithBooks = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { id } = req.params;
 
    try {
        const reviews = await Review.findAll({
            where: { user_id: Number(id) },
            include: [{ model: Book,
                attributes: ['id', 'title','author', 'author_id',], 
                 as: 'reviewBook' }] 
        });
 
        res.status(200).json({success:true, reviews});
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: error.message });
    }
 };


 const fetchReviewsForBook = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { id } = req.params; 

    try {
        const reviews = await Review.findAll({
            where: { book_id: id },
            include: [
                {
                    model: Book,
                    as: 'reviewBook',  // Association alias for Book
                    attributes: ['id', 'title', 'author', 'language', 'publicationYear', 'price'],  // Specify the fields you want to include from the Book model
                },
                {
                    model: User,
                    as: 'reviewUser',  // Association alias for User
                    attributes: ['id', 'fname', 'email'],  // Specify the fields you want to include from the User model
                }
            ]
        });
        if (!reviews) {
            return res.status(404).json({success: false,  message: 'Book does not has review' });
        }


        res.status(200).json({success: true, message: 'Review fetched successfully' ,reviews});
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    fetchUserReviewdWithBooks,
    createReview,
    getAllReviews,
    getReviewById,
    updateReview,
    deleteReview,
    fetchReviewsForBook,
    updateStatus
}