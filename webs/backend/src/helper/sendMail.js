import nodemailer from 'nodemailer';

// send mail by using nodemailer
export const sendMail = async (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    let mailOptions = {
        from: "HustEdu Learning App",
        to: email,
        subject: subject,
        html: html
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully', info);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};