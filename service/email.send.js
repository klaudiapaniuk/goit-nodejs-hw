const nodemailer = require("nodemailer");
require("dotenv").config();

const transport = nodemailer.createTransport({
	host: "sandbox.smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: process.env.USER,
		pass: process.env.PASSWORD,
	},
});

const verificationEmail = async (userEmail, verificationToken) => {
	const emailOptions = {
		from: process.env.USER,
		to: userEmail,
		subject: "Verify your e-mail",
		html: `Verify your e-mail via: http://localhost:3000/api/users/verify/${verificationToken}`,
	};

	transport.sendMail(emailOptions).catch((err) => console.log(err));
};

module.exports = { verificationEmail };
