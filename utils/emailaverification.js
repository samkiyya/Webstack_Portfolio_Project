const nodemailer = require('nodemailer');


const sendVerificationEmail = async(userEmail, userName,verificationToken)=> {
   console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS)
   // const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
   const verificationLink = `${process.env.REACT_APP_URL}/verify-email/${verificationToken}`;
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
        subject: 'Verification Link',
        html: `
            <p>Dear ${userName},</p>
            <p>Please verify your email by clicking the link below:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p
            <p>your verification link will expire in 2 hours.</p
            <p>Please do not share this Link with others.</p>
            <p>If you didn't request this, simply ignore this message.</p>
            <p>Yours,<br>The Support Team</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
     return { success: false, error: error.message };
    }
}
module.exports = sendVerificationEmail