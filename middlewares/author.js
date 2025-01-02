
const { paramsSchema } = require('../helpers/schema');
const  Book = require('../models/BookModel'); 

const isAuthorOfTheBook = async (req, res, next) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const bookId  = Number(req.params.id); 
    const userId = req.user.id; 

    try {
      
        const book = await Book.findByPk(bookId);

       
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

   
        if (book.author_id !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to perform operation this book. It is not your book' });
        }

        next(); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


const isAuthor = (req, res, next) => {
    
    if (req.user && req.user.role === 'AUTHOR') {
        next(); 
    } else {
        return res.status(403).json({ success: false, message: 'Access denied. Author only can access.' });
    }
};

const isTheRoleIsNotUser = ()=>{

    if (req.user && req.user.role === 'AUTHOR') {
        return res.status(403).json({ success: false, message: 'Access denied. only user can order.' });
    } else {
        next(); 
    }

}

module.exports ={
    isAuthor,
    isTheRoleIsNotUser,
    isAuthorOfTheBook
} 
