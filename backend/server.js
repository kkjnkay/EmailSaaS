const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const imaps = require('imap-simple');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/check-email', async (req, res) => {
  const {
    email,
    imapHost,
    imapPort,
    imapPassword,
    smtpHost,
    smtpPort,
    smtpPassword
  } = req.body;

  try {
    // IMAP перевірка
    const imapConfig = {
      imap: {
        user: email,
        password: imapPassword,
        host: imapHost,
        port: parseInt(imapPort),
        tls: true,
        authTimeout: 5000
      }
    };
    const imapConnection = await imaps.connect(imapConfig);
    await imapConnection.end();

    // SMTP перевірка
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: email,
        pass: smtpPassword
      }
    });
    await transporter.verify();

    res.json({ success: true });
  } catch (err) {
    console.error('🔴 Перевірка неуспішна:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.listen(3001, () => console.log('✅ Email Check API запущено на http://localhost:3001'));
