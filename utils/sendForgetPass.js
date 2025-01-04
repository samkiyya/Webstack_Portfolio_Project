const nodemailer = require('nodemailer');
const { forgotPasswordEmailTemplate } = require('./forgetPassTemplate');
require('dotenv').config();
const sendForgotPasswordEmail = async (userEmail, userName, resetToken)=> {
    const resetLink = `https://abyssiniasoftware.com/reset-password/${resetToken}`;
    
    const emailTemplate = forgotPasswordEmailTemplate(userName, resetLink);//check 

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secure: true, 
        port:  465,
        auth: {
          user: process.env.EMAIL_USER,  
          pass: process.env.EMAIL_PASS
        },
      
          
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Password Reset Request',
        html: emailTemplate,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

module.exports = sendForgotPasswordEmail