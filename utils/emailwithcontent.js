const nodemailer = require('nodemailer');


const sendEmailtoUser = async(userEmail,adminName, subject,userName,text)=> {
   console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS)

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
        subject: `${subject}`,
        html: `
            <h1>${subject}</h1>
            <p>Dear,<b> ${userName}</b</p>
            <p>This email is sent by <b>${adminName ? adminName : 'Admin'}</b>.</p>
            <p style="font-weight: bold; font-size: 16px; color: #333; padding: 10px ; background-color: #f4f4f4">${text}.</p>

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
module.exports = sendEmailtoUser