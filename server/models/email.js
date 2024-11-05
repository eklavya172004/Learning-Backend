const nodemailer = require('nodemailer');
require('dotenv').config(); 

const sendmail = async options => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, 
        auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD
        },
    })

    console.log(process.env.EMAIL_USER);
    const mailOptions = {
        from: 'eklavyanath1704@gmail.com',
        to:options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions);
}

module.exports = sendmail;