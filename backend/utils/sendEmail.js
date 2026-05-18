const nodemailer = require('nodemailer');

async function sendEmail({ smtpHost, smtpPort, smtpUser, smtpPass, to, subject, body }) {
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: smtpUser,
    to,
    subject,
    text: body,
  });
}

module.exports = sendEmail;
