const  User = require('../models/Usermodel'); 


const isTheRoleIsAuthor = async (req, res, next) => {
    const accountId = Number(req.body.user_id); 
    try {
        const user = await User.findByPk(accountId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Author to follow not found' });
        }

        if (user.role === 'USER') {
            return res.status(403).json({ success: false, message: 'You can not follow a user' });
        }
        if (user.id === req.user.id) {
            return res.status(403).json({ success: false, message: 'You can not follow or unfollow yourself' });
        }

        next(); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
    
}





module.exports = isTheRoleIsAuthor;