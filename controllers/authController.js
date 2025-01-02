const  User  = require('../models/Usermodel'); 
const Subscription = require('../models/SubscriptionModel');
const TwoFactorAuth = require('../models/TwoFactorModel');
const SubscriptionOrder = require('../models/SubscriptionOrderModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const sendForgotPasswordEmail = require('../utils/sendForgetPass');
const sendVerificationEmail = require('../utils/emailaverification');
const { userSchema, loginSchema, twoStepSchema, tokenParamsSchema, changePasswordSchema, forgotPasswordSchema, passwordSchema } = require('../helpers/schema');
const Level = require('../models/LevelModel');
const sendTwoStepVerificationEmail = require('../utils/send2FA');
const Following = require('../models/FollowingModel');
require('dotenv').config();

const registerUser =async (req, res) => {
  const { error } = userSchema.validate(req.body);

if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
}
    try {
   
    const { email, password, fname, referalCode,lname,phone,city,country,role, bio,} = req.body;
    //console.log(email, password, fname, lname,phone,role)
     
     let user
     user = await User.findOne({ where: { email } });
      if(user){
       return  res.status(400).json({success: false, error: 'User already exists, try login.' });
        }
        if(phone) {
          const existingUserByPhone = await User.findOne({ where: { phone } });
            if (existingUserByPhone) {
                return res.status(400).json({ success: false, message: 'Phone number already exists. Please use a different phone number.' });
            }
          }       
     
       const hashedPassword = await bcrypt.hash(password, 10);
       const subscription = await Subscription.findOne({where:{id:1}})
        user = await User.create({ email, password: hashedPassword ,fname,lname,phone,role,city,country,bio,level_id:1});
     
        const currentDate = new Date();
        user.subscription_id = subscription.id
        user.referalCode = referalCode        
        user.expirationDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
        await user.save()
        orderNumber = `subOrder-${Date.now()}`   

         await SubscriptionOrder.create({user_id:user.id, totalPrice : subscription.price,receiptImage:'No image', subscription_id: subscription.id,
          subscriptionType:'Yearly',status:'APPROVED',reviewedBy:'Default',orderNumber});
        
        const token = jwt.sign({ id: user.id, fname: user.fname }, process.env.JWT_EMAIL_SECRET, { expiresIn: '3h' });
      //   await sendVerificationEmail(user.email, user.fname, token);

     return   res.status(201).json({success: true, message: 'User registered successfully!. we will send a verification link to your email. Please verify your email'});
  
     
    } catch (error) {
        res.status(500).json({ success: false,error: error.message });
    }
  }
  const userLogin = async (req, res) => {
    try {
      const { error } = loginSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, password } = req.body;
    
   
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
  console.log(user.isTwoStepOn, 'hee')

        if (user.isTwoStepOn) {
              let twofactor = await TwoFactorAuth.findOne({ where: { user_id: user.id } });
              // console.log(twofactor)
              if (!twofactor?.verificationCode || new Date() > twofactor.codeExpiration ) {

                const verificationCode = Math.floor(10000 + Math.random() * 90000).toString(); 
                console.log(verificationCode)
               if(!twofactor){

               
                twofactor = await TwoFactorAuth.create({user_id: user.id, verificationCode: await bcrypt.hash(verificationCode, 10), 
                  codeExpiration: new Date(Date.now() + 5* 60 * 1000)});
               // await sendTwoStepVerificationEmail(user.email, user.fname, verificationCode);
                return res.status(200).json({showTwoFactor: true,success: true,user_id: user.id, message: '2FA verification code sent to your email'});
              }//notexist
                else{
                  twofactor.verificationCode = await bcrypt.hash(verificationCode, 10);
                  twofactor.codeExpiration = new Date(Date.now() + 5* 60 * 1000);
                  await twofactor.save();
                  await sendTwoStepVerificationEmail(user.email, user.fname, verificationCode);
                  return res.status(200).json({showTwoFactor: true,success: true,user_id: user.id, message: '2FA verification code sent to your email'});
                }
                  
                }//my exp  
                


                else{
                  return res.status(200).json({showTwoFactor: true,success: true,user_id: user.id, message: 'Your 2FA verification code is still valid' });
                }
                

                   }//TWO step
  
        const userToken = jwt.sign({ id: user.id, fname: user.fname, lname:user.lname,role: user.role,  }, process.env.JWT_USER_SECRET, { expiresIn: '3h' });
        res.cookie('userToken',userToken,{ httpOnly: true , sameSite : 'None'});
        return res.status(200).json({ userToken, userData: {id: user.id, fname: user.fname, lname:user.lname , role: user.role,provider:user.provider, image: user.imageFilePath} });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', err: error.message});
    }
  }

  const verifyTwoFactorCode = async (req, res) => {
    try {
      const { error } = twoStepSchema.validate(req.body);
    
      if (error) {
          return res.status(400).json({ success: false, message: error.details[0].message });
      }

    const { verificationCode, user_id } = req.body;
    const user = await User.findOne({ where: { id: user_id, isTwoStepOn: true } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or 2FA is not enabled' });
    }
    const twofactor = await TwoFactorAuth.findOne({ where: { user_id: user.id} });
    if(!twofactor){
      return res.status(404).json({success: false,showTwoFactor: false, message: 'two factor not found for this user' });
    }
    if (!twofactor.verificationCode || new Date() > twofactor.codeExpiration ) {
      return res.status(400).json({success: false,showTwoFactor: false, expired : true, message: '2FA verification code expired, please login again' });
    }

    const isMatch = await bcrypt.compare(verificationCode, twofactor.verificationCode);
    if (!isMatch) {
      return res.status(400).json({success: false, message: 'Invalid verification code' });
    }

    const userToken = jwt.sign({ id: user.id, fname: user.fname, role: user.role, }, process.env.JWT_USER_SECRET, { expiresIn: '3h' });
    res.status(200).cookie('userToken',userToken,{ httpOnly: true , sameSite : 'None'}).json({ userToken, userData: {id: user.id, fname: user.fname, lname:user.lname , role: user.role,provider:user.provider, image: user.imageFilePath} });
  } catch (error) {
    res.status(500).json({ message: 'two factor verification failed', error: error.message});
  }

  }


  const verifyUserAccountFromEmail = async (req, res) => {

    const { error } = tokenParamsSchema.validate(req.params);
    
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { token } = req.params;
    
      try {
        if (!token) {
            return res.status(400).json({ success: false,error: 'no token found' });
        }
          const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
  
          if (!decoded) {
              return res.json({success: false, error: 'Invalid token' });
          }
  
          const id = decoded.id;
          const user = await User.findOne({ where: { id , isVerified: false} });

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found or already verified' });
            }
          user.isVerified = true;
          await user.save();
  
  
          res.status(200).json({ success: true, message: ` hello ${user.fname}, your account verified successfully` });
      } catch (error) {
       
          res.status(500).json({ success: false, error: error});
      }

  }
      

const verifyUserSession =(req,res)=>{
      try{
          
          return res.json({success: true, user: req.user})
      }catch(error){
   
        res.status(500).json({ success: false,error: error.message });
      }
  }


  
  const userLogout = (req,res)=>{
    try{

        res.clearCookie('userToken');
        return res.json({success: true,message: "logged out successfully"});
    }
    catch(error){
        res.status(500).json({ success: false,error: error.message });

    }
  }
  const changePassword = async (req, res) => {
    const { error } = changePasswordSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id; 
  
      try {
          const user = await User.findByPk(userId);
          
          if (!user) {
              return res.status(404).json({ message: 'User not found' });
          }
  
       
          const isMatch = await bcrypt.compare(oldPassword, user.password);
          
          if (!isMatch) {
              return res.status(400).json({ message: 'Old password is incorrect' });
          }
  
          user.password = await bcrypt.hash(newPassword, 10);
          await user.save();
  
          res.status(200).json({success: true, message: 'Password changed successfully' });
      } catch (error) {
          console.error('Error changing password:', error);
          res.status(500).json({ success: false, error: error.message });
      }
  };
  
  const userForgetPassword = async (req, res) => {
      try {
        const { error: emailError } = forgotPasswordSchema.validate(req.body);
    
     if (emailError) {
        return res.status(400).json({ success: false, message: emailError.details[0].message });
    }

          const { email } = req.body;
  
       
          const user = await User.findOne({ where: { email } });
  
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

  const userResetPassword = async (req, res) => {
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
  
        
          await User.update({ password: hashedPassword }, { where: { id } });
  
          res.status(200).json({ success: true, message: `hello, ${decoded.fname}, your password reset successfully` });
      } catch (error) {
       
          res.status(500).json({ success: false, error: error});
      }
  };

  const sendMeVerificationEmail = async (req, res) => {

     try {
      const { error: emailError } = forgotPasswordSchema.validate(req.body);
    
      if (emailError) {
         return res.status(400).json({ success: false, message: emailError.details[0].message });
     }
          const { email } = req.body;
  
       
          const user = await User.findOne({ where: { email, isVerified: false } });
  
          if (!user) {
              return res.json({success: false, message: 'User not found or already verified' });
          }
  
          const token = jwt.sign({ id: user.id, fname: user.fname }, process.env.JWT_EMAIL_SECRET, { expiresIn: '2h' });
          const {success, message, error} = await sendVerificationEmail(user.email, user.fname, token);
          if(success){
              return res.status(200).json({success: true, message: 'Verification link sent to your email' });
          }

          return res.status(400).json({success: success, error: error})
  
         
      } catch (error) {
        res.status(500).json({ success: false, error: error});
      }
  }

const toggleTwoFactorAuth = async (req, res) => {
 const id = req.user.id;

  try {

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    console.log(user.isTwoStepOn)

    user.isTwoStepOn =  user.isTwoStepOn ? false : true;

    await user.save().catch(err => {
      console.error('Error saving user:', err)});

    return res.status(200).json({ success: true, isTwoStepOn: user.isTwoStepOn })

  }catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

}

const userprofile = async (req, res) => {
  try {
      const userId = req.user.id; 
      const user = await User.findOne({
        where: { id: userId },
          attributes: { exclude: ['password'] },
          include: [
              {
                  model: Subscription,
                  as: 'subscription',
              },
              {
                  model: Level,
                  as: 'levelUser',
              }
          ]
          
      });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

    
      const followerCount = await Following.count({
          where:{ followed_id:userId },});
          
      const followingCount = await Following.count({
        where:{ follower_id:userId },});

      return res.status(200).json({ success: true, user, followerCount, followingCount });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
  }
}




  module.exports = {
    userprofile,
    toggleTwoFactorAuth,
    registerUser,
    userLogin,
    userLogout,
    verifyUserSession,
    changePassword,
    userForgetPassword,
    userResetPassword,
    sendMeVerificationEmail,
    verifyUserAccountFromEmail,
    verifyTwoFactorCode
    


  }