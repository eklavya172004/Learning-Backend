const nodemailer = require('nodemailer');
require('dotenv').config(); 

const sendmail = async options => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false, 
        auth: {
              user: 'postmaster@sandbox06fb72a9864c4f04900a31593ac7acfd.mailgun.org',
             pass: '7c92b4aa4ad67fc9c0051d41f030fc87-72e4a3d5-f15f5ad6'
        },
    })


    const mailOptions = {
        from: 'eklavyanath1704@gmail.com',
        to:options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions);
}

module.exports = sendmail;