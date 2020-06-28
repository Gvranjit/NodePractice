const nodemailer = require("nodemailer");
const { json } = require("body-parser");
const { password } = require("../config.json");

const msg = {
     to: "gvranjit@gmail.com",
     from: "gvranjit@hotmail.com",
     subject: "This is a test message. Sending with SendGrid is fun",
     text: "I hope this works",
     html: "and easy to do even with Node.js.",
};

const transporter = nodemailer.createTransport({
     host: "smtp-mail.outlook.com",
     port: 587,
     secureConnection: false,
     tls: {
          ciphers: "SSLv3",
     },
     auth: {
          user: "gvranjit@hotmail.com",
          pass: password,
     },
});
transporter.sendMail(msg, function (error, info) {
     if (error) {
          return console.log(error);
     }
     console.log("Message sent: " + info.response);
});

// console.log(password);
