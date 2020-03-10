const nodemailer = require('nodemailer');

if (!process.env.MAILGUN_USER) {
  throw new Error('Requires process.env.MAILGUN_USER to start');
}

if (!process.env.MAILGUN_PASSWORD) {
  throw new Error('Requires process.env.MAILGUN_PASSWORD to start');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASSWORD,
  },
});

module.exports = {
  send({ to, subject, text, from = 'noreply@arcblockio.cn' }) {
    return new Promise((resolve, reject) => {
      transporter.sendMail({ from, to, subject, text }, (err, res) => {
        console.log('mailgun.send', { to, subject, text, err, res });
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },
};
