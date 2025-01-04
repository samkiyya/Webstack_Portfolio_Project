
const nodemailer = require('nodemailer');
const  User  = require('../models/Usermodel'); 

const sendBulkEmail = async (subject, message) => {
  
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
    });

    try {
      
        const users = await User.findAll({ where: { isActive: true } });
        const emailAddresses = users.map(user => user.email);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emailAddresses, 
            subject: subject,
            text: message,
            html: `<p>${message}</p>`, 
        };

       
        const info = await transporter.sendMail(mailOptions);
        console.log('Emails sent:', info.response);
        
        return { success: true, message: 'Emails sent successfully!' };
    } catch (error) {
        console.error('Error sending emails:', error);
        return { success: false, error: error.message };
    }
};

module.exports = sendBulkEmail;