const  Admin = require('../models/AdminModel'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { adminRegistrationSchema, loginSchema, changePasswordSchema, tokenParamsSchema, forgotPasswordSchema, twoStepSchema, adminTwoStepSchema, paramsSchema, adminRoleSchema, updateAdminSchema, passwordSchema } = require('../helpers/schema');
const sendForgotPasswordEmail = require('../utils/sendForgetPass');

require('dotenv').config();


const registerAdmin =async (req, res) => {
    try {
      const {error} = adminRegistrationSchema.validate(req.body);

      if (error) {
          return res.status(400).json({ success: false, message: error.details[0].message });
      }

    const { email, password,fname,lname,role } = req.body;
    
    let user
     user = await Admin.findOne({ where: { email } });
     if(user){
      res.status(400).json({success: false, error: 'Admin already exists.' });
     }
     else {
          

    const hashedPassword = await bcrypt.hash(password, 10);
    

        user = await Admin.create({ email, password: hashedPassword , fname,lname,role});

        const referalCode = `admin-${user.fname}-${Date.now()}`
        user.referalCode = referalCode
        await user.save()
        res.status(201).json({success: true, message: 'Admin registered successfully!'});
  
     }
     
    } catch (error) {
        res.status(500).json({ success: false,error: error.message });
    }
  }
  


const updateAdmin = async (req, res) => {
  try {

    const {error} = updateAdminSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

      const  id  = req.user.id; 
      const {  fname, lname,  } = req.body;
        
      
      let user = await Admin.findByPk(id);
      if (!user) {
          return res.status(404).json({ success: false, message: 'Admin not found.' });
      }
        
      user.fname = fname !== undefined ? fname : user.fname;
      user.lname = lname !== undefined ? lname : user.lname;
  
      await user.save();

      res.status(200).json({ success: true, message: 'Admin updated successfully!' });

  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    console.log("Request Params:", req.params); // Debugging
    console.log("Request Body:", req.body); // Debugging


    const { id } = req.params;
    console.log("ID Extracted:", id); // Debugging
    const { fname, lname, role } = req.body;

    let user = await Admin.findByPk(id);
    if (!user) {
      console.error("Admin Not Found:", id); // Debugging
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    user.fname = fname !== undefined ? fname : user.fname;
    user.lname = lname !== undefined ? lname : user.lname;
    user.role = role !== undefined ? role : user.role;

    await user.save();

    console.log("Updated User:", user); // Debugging
    res.status(200).json({
      success: true,
      message: "Admin updated successfully!",
    });
  } catch (error) {
    console.error("Server Error:", error.message); // Debugging
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};



const updateRole = async (req, res) => {
  try {

    const { error: paramsError } = paramsSchema.validate(req.params);
    
    if (paramsError) {
        return res.status(400).json({ success: false, message: paramsError.details[0].message });
    }
 
    const { error: bodyError } = adminRoleSchema.validate(req.body);
    
    if (bodyError) {
        return res.status(400).json({ success: false, message: bodyError.details[0].message });
    }
      const  id  = req.params.id; 
      const {   role } = req.body;

      
      let user = await Admin.findByPk(id);
      if (!user) {
          return res.status(404).json({ success: false, message: 'Admin not found.' });
      }
      if(user.role === "ADMIN"){
        return res.status(403).json({ success: false, message: 'u can not change admin role.' });
      }
      user.role = role !== undefined ? role : user.role;
      await user.save();

      res.status(200).json({ success: true, message: 'Admin role updated successfully!' });

  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
};

  const getAllAdmins = async (req, res) => {
    try {
      const admins = await Admin.findAll({

        attributes: {
               
          exclude: ['password'], 
      },
      });  
      res.status(200).json(admins );  
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  const getAllModerators = async (req, res) => {
    try {
      const admins = await Admin.findAll({
        where:{
          role:"MODERATOR"
        },

        attributes: {
               
          exclude: [ 'password'], 
      },
      });  
      res.status(200).json(admins );  
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  

const deleteAdminById = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
  }
  const adminId = req.params.id; 

  try { 
      
    let user = await Admin.findByPk(adminId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    if(user.id ===1){
      return res.status(403).json({ success: false, message: 'u can not delete admin.' });
    }
    const result = await Admin.destroy({
      where: { id: adminId }, 
    });

    if (result === 0) {
      return res.status(404).json({ success: false, message: 'Admin not deleted ' });
    }

    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const adminLogin = async (req, res) => {
    try {
      const {error} = loginSchema.validate(req.body);

      if (error) {
          return res.status(400).json({ success: false, message: error.details[0].message });
      }

    const { email, password,  } = req.body;
    
   
        const user = await Admin.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
  
        const adminToken = jwt.sign({ id: user.id, fname: user.fname, role: user.role, }, process.env.JWT_ADMIN_SECRET, { expiresIn: '3h', });
        res.cookie('adminToken',adminToken,{ httpOnly: true , sameSite : 'None'})
      return res.status(200).json({ adminToken, admin: {id: user.id, fname: user.fname, lname:user.lname , role: user.role,} });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
  }


  
const verifyAdminSession =(req,res)=>{
    try{
        
        return res.json({success: true, user: req.user})
    }catch(error){
 
      res.status(500).json({ success: false,error: error.message });
    }
}

  
  const adminLogout = (req,res)=>{
    try{

        res.clearCookie('adminToken');
        return res.json({success: true,message: "logged out successfully"});
    }
    catch(error){
        res.status(500).json({ success: false,error: error.message });

    }
  }



  
  
  const adminchangePassword = async (req, res) => {
    const { error } = changePasswordSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id; 
  
      try {
          const user = await Admin.findByPk(userId);
          
          if (!user) {
              return res.status(404).json({ message: 'Admin not found' });
          }
  
       
          const isMatch = await bcrypt.compare(oldPassword, user.password);
          
          if (!isMatch) {
              return res.status(400).json({ message: 'Old password is incorrect' });
          }
  
          user.password = await bcrypt.hash(newPassword, 10);
          await user.save();
  
          res.status(200).json({success: true, message: 'Password changed successfully' });
      } catch (error) {
        
          res.status(500).json({ success: false, error: error.message });
      }
  };
  
  const adminForgetPassword = async (req, res) => {
      try {
        const { error: emailError } = forgotPasswordSchema.validate(req.body);
    
     if (emailError) {
        return res.status(400).json({ success: false, message: emailError.details[0].message });
    }

          const { email } = req.body;
  
       
          const user = await Admin.findOne({ where: { email } });
  
          if (!user) {
              return res.json({success: false, message: 'User not found' });
          }
  
          const token = jwt.sign({ id: user.id ,fname: user.fname}, process.env.JWT_EMAIL_SECRET, { expiresIn: '3h' });
          const {success, message, error} = await sendForgotPasswordEmail(user.email, user.fname, token);
          if(success){
              return res.status(200).json({success: true, message: 'Password reset link sent to your email, please check your email' });
          }

          return res.status(400).json({success: success, error: error})
  
         
      } catch (error) {
        res.status(500).json({ success: false, error: error});
      }
  };

  const adminResetPassword = async (req, res) => {
    const { error } = tokenParamsSchema.validate(req.params);
    
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { error :bodyError} = passwordSchema.validate(req.body);
    
    if (bodyError) {
        return res.status(400).json({ success: false, message: bodyError.details[0].message });
    }
    
      const { token } = req.params;
    const { password } = req.body;
      try {
        if (!token) {
            return res.status(400).json({ success: false,error: 'no token found' });
        }
       
          const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
  
          if (!decoded) {
              return res.json({success: false, error: 'Invalid token' });
          }
  
          const id = decoded.id;
          const hashedPassword = await bcrypt.hash(password, 10);
  
        
          await Admin.update({ password: hashedPassword }, { where: { id } });
  
          res.status(200).json({ success: true, message: `hello ${decoded.fname}, your password reset successfully` });
      } catch (error) {
       
          res.status(500).json({ success: false, error: error});
      }
  };


  
  const adminProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        const user = await Admin.findOne({
          where: { id: userId },
            attributes: { exclude: ['password'] },
        });
  
        if (!user) {
            return res.status(404).json({ message: 'admin not found' });
        }
  
  
        return res.status(200).json({ success: true, user,  });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
  
  
const getAdminReferalLink = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await Admin.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false,message: 'User not found' });
    }

    const referalLink = `${process.env.REACT_APP_URL}/admin-referal/${user.referalCode}`
    res.status(200).json({success: true, referalLink});

  }catch (error) {
    res.status(500).json({ success: false,error: error.message });
  }
}

  module.exports = {
    getAdminReferalLink,
    adminProfile,
    getAllModerators,
    updateRole,
    adminchangePassword,
    adminForgetPassword,
    adminResetPassword,
    //adminLoginWith2fa,
    //adminVerifyTwoFactorCode,
   // adminchange2faPassword,


adminLogin,
registerAdmin,
adminLogout,
verifyAdminSession,
getAllAdmins,
updateAdmin,
updateAdminProfile,
deleteAdminById

  }
