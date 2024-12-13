const nodemailer = require("nodemailer");


exports.sendMail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            // service: process.env.SMPT_SERVICE,
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: options.to,
            subject: "reset password",
            text: options.text,
        }
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.log("mail not sent");
        console.log(error.message)
    }
}





