

const { paramsSchema, communicationSchema, communicationUpdateSchema } = require('../helpers/schema');
const Book = require('../models/BookModel');
const Communication = require('../models/CommunicationModel');
const User = require('../models/Usermodel');

const createCommunication = async (req, res) => {
    try {

        const { error } = communicationSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { message, serviceCharge,  book_id,  } = req.body;
        const book = await Book.findOne({ where: { id: book_id } });

        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        let data
        data = await Communication.findOne({ where: { book_id, author_id: book.author_id} });
        if(data){
         return res.status(400).json({success: false, error: 'Communication already exists.' });
         }

        const newCommunication = await Communication.create({ message, serviceCharge, book_id, author_id: book.author_id,reviewedBy: req.user?.fname + " " + req.user?.lname});

        return res.status(201).json({ succss: true, message: 'Communication created successfully', newCommunication});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const getAllCommunications = async (req, res) => {
    try {
        const communications = await Communication.findAll({
            include: [
                {
                    model: Book,
                    as: 'comBook',
                    attributes: ['id', 'title', 'author', 'price']

                },
                {
                    model: User,
                    as: 'comUser',
                    attributes: ['id', 'fname', 'lname']
                }
                
            ]
        });
        return res.status(200).json(communications);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const getCommunicationById = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

  if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
  }

    const { id } = req.params;

    try {
        const communication = await Communication.findOne({
            where: { id : Number(id) },
            include: [
                {
                    model: Book,
                    as: 'comBook',
                    attributes: ['id', 'title', 'author', 'price']

                },
                {
                    model: User,
                    as: 'comUser',
                    attributes: ['id', 'fname', 'lname']
                }
                
                
            ]
        });
        if (!communication) {
            return res.status(404).json({ message: 'Communication not found' });
        }
        return res.status(200).json({ succss: true, communication});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getLoggedInAuthorcommunications = async (req, res) => {
    try {
        const authorId = req.user.id;
        const communications = await Communication.findAll({
            where: { author_id: authorId },
            include: [
                {
                    model: Book,
                    as: 'comBook',
                    attributes: ['id', 'title', 'author', 'price']

                },
               
                
            ] 
        })

        if (!communications) {
            return res.status(404).json({ message: 'No agrement found ' });
        }

        return res.status(200).json({ succss: true, communications});

    }catch(error) {
        return res.status(500).json({ message: error.message });
    }
    
} 


const updateCommunication = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

  if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
  }
  const { error: errorUpdate } = communicationUpdateSchema.validate(req.body);

  if (errorUpdate) {
      return res.status(400).json({ success: false, message: errorUpdate.details[0].message });
  }

    const { id } = req.params;
    const { message, serviceCharge, isAgreed, book_id} = req.body;


    try {
      

      let updated = await Communication.findOne({ where: { id: Number(id) } });

        if (!updated) {
            return res.status(404).json({ message: 'Communication not found' });
        }
        if (updated.isAgreed) {
            return res.status(400).json({ message: 'Agreement already exists' });
        }
         updated.message = message? message : updated.message;
         updated.serviceCharge = serviceCharge? serviceCharge : updated.serviceCharge;
         updated.isAgreed = isAgreed? isAgreed : updated.isAgreed;
         updated.reviewedBy = req.user?.fname + " " + req.user?.lname;

        await updated.save();
        
        return res.status(200).json({succss: true, message: 'Communication updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const isAgreed = async (req, res) => {
    try {
        const { error } = paramsSchema.validate(req.params);

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }      
    
        const { id } = req.params;
        const authorId = req.user.id;

        let communication = await Communication.findOne({
            where: { id: Number(id), author_id: authorId },
        });

        if (!communication) {
            return res.status(404).json({ message: 'Communication not found' });
        }

        if (communication.isAgreed) {
            return res.status(400).json({ message: 'Agreement already exists' });
        }

        communication.isAgreed = true;
        await communication.save();

        let book = await Book.findOne({
            where: { author_id: authorId },
        });
        book.serviceCharges = communication.serviceCharge
        await book.save()


        return res.status(200).json({ success: true, message: `You successfully agreed to a service charge of ${communication.serviceCharge} percent of the book price for the book named ${book?.title} ` });


    }catch(error) {
        return res.status(500).json({ message: error.message });
    }
}

const isNotAgreed = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    
  
  

    const { id } = req.params;

    const authorId = req.user.id;
    const {  reason , isAgreed} = req.body;

    try {
    
     
        let communication = await Communication.findOne({
            where: { id: Number(id), author_id: authorId },
        });

        if (!communication) {
            return res.status(404).json({ message: 'Communication not found' });
        }
        
       communication.reason = reason !== undefined ? reason : communication.reason;
       communication.isAgreed = isAgreed;

        await communication.save();

        return res.status(200).json({ success: true, message: 'You sent a reason for not agreeing to the service charge' });

    } catch (error) {
        return res.status(500).json({ message: error.message });
        
    }


}



const deleteCommunication = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
  

    const { id } = req.params;

    try {
        const deleted = await Communication.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).json({ message: 'Communication not found' });
        }
        return res.status(204).json({success: true, message: 'Communication deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const notAgreedCommunication = async (req, res) => {
   try{
    const notAgreedCommunications = await Communication.findAll({
        where: {
            
            isAgreed: false
        }
    })
    if(!notAgreedCommunications){
        return res.status(404).json({success: false, message: 'No notAgreedCommunications found'});
    }

    return res.status(200).json({succss: true, notAgreedCommunications});
}catch(error){
   return res.status(500).json({success: false, message: error.message });
}
}
module.exports = {
    createCommunication,
    getAllCommunications,
    getCommunicationById,
    updateCommunication,
    deleteCommunication,
    notAgreedCommunication,
    getLoggedInAuthorcommunications,
    isAgreed,
    isNotAgreed,
}