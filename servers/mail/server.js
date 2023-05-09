// See: https://www.stackhawk.com/blog/angular-cors-guide-examples-and-how-to-enable-it/#fix-cors-on-the-server-side
// See: https://www.abstractapi.com/guides/node-js-get-ip-address

const express = require("express");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const IP = require('ip');

const server = express();
const port = process.env.PORT || 3001;
const hostname = '0.0.0.0';
//const clientBaseURL = 'http://wash.water.go.ke:80/#';
const clientBaseURL = 'http://localhost:420s0/#';

const router = express.Router();

server.use(express.json());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cors());
server.use('/api/v1/emails', router);

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mis.washke@gmail.com',
      pass: 'rnrihocwwcrwsznr'
    }
  }) // initialize create Transport service



router.post('/confirmation', (req, res) => {

    const { to, token } = req.body;

    const mailData = {
        from: '"Reporting Tool" <mis.washke@gmail.com>',
        to: to,
        subject: 'Registration Confirmation',
        text: `Please go to the following link to confirm your email and activate your account: ${clientBaseURL}/auth/confirmation/${token}`,
        html: `<p>Please click this <a href="${clientBaseURL}/auth/confirmation/${token}" target="_blank">link</a> to confirm your email and activate your account</p>`
    };

    transporter.sendMail(mailData, (error, info) => {

        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json({ messageId: info.messageId, message: "Account Confirmation Mail Sent" });
        }

    });
});


router.post('/recovery', (req, res) => {

    const { to, token } = req.body;

    const mailData = {
        from: 'mis.washke@gmail.com',
        to: to,
        subject: 'Password Recovery',
        text: `Please go to the following link to reset your account password: ${clientBaseURL}/auth/recovery/${token}`,
        html: `<p>Please click this <a href="${clientBaseURL}/auth/recovery/${token}" target="_blank">link</a> to reset your account password</p>`
    };

    transporter.sendMail(mailData, (error, info) => {

        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json({ messageId: info.messageId, message: "Password Recovery Mail Sent" });
        }

    });
});


router.post('/notification', (req, res) => {

    const { to, subject, message } = req.body;

    const mailData = {
        from: 'mis.washke@gmail.com',
        to: to,
        subject: subject,
        text: `${message}`,
        html: `<p>${message}</p>`
    };

    transporter.sendMail(mailData, (error, info) => {

        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json({ messageId: info.messageId, message: "Notification Mail Sent" });
        }

    });
});


server.listen(port, hostname, () => {
    console.log(`Mail server is running on host ${hostname} and port ${port}`);
});
