
const { tokenParamsSchema, paramsSchema } = require('../helpers/schema');
const Admin = require('../models/AdminModel');
const  User = require('../models/Usermodel'); 

const isAccountOwner = async (req, res, next) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const userId = req.user.id; 
    const accountId = Number(req.params.id); 

    try {
        const user = await User.findByPk(accountId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.id !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to modify this account' });
        }

        next(); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


const isAdminAccountOwner = async (req, res, next) => {
    const userId = req.user.id; 
    const accountId = Number(req.params.id); 

    try {
        const user = await Admin.findByPk(accountId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.id !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to modify this account' });
        }

        next(); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


const checkReferalCode = async (req, res, next) => {
    const { error } = tokenParamsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { token } = req.params;

    try {
        let record;

        if (token.startsWith('user-')) {
          
            record = await User.findOne({
                where: { referalCode: token }
            });
        } else if (token.startsWith('admin-')) {
            
            record = await Admin.findOne({
                where: { referalCode: token }
            });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid referral code ' });
        }

        if (!record) {
            return res.status(404).json({ success: false, message: 'No referral code found for this user' });
        }

        req.referal = record;
        
        next();
    } catch (error) {
        console.error('Error checking referral code:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { isAccountOwner, isAdminAccountOwner, checkReferalCode}