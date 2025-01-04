
const nodemailer = require('nodemailer');

const sendTwoStepVerificationEmail = async (userEmail, userName , Code) => {

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
        subject: 'Two-Step Verification Code',
        html: `
            <p>Dear: <b>${userName}</b> </p>
            <p>Your code is: <b>${Code}</b> Use it to access your account.</p>
         
            <p>your two step verification code will expire in 5 minutes.</p
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

module.exports = sendTwoStepVerificationEmail;