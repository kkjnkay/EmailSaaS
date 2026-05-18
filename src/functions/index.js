const functions = require('firebase-functions');
const imaps = require('imap-simple');
const nodemailer = require('nodemailer');

exports.verifyEmailConnection = functions.https.onCall(async (data, context) => {
  const {
    imapHost,
    imapPort,
    imapPassword,
    email,
    smtpHost,
    smtpPort,
    smtpPassword,
  } = data;

  try {
    // ✅ Перевірка IMAP
    const imapConfig = {
      imap: {
        user: email,
        password: imapPassword,
        host: imapHost,
        port: parseInt(imapPort),
        tls: true,
        authTimeout: 5000,
      },
    };

    const connection = await imaps.connect(imapConfig);
    await connection.end(); // закриваємо IMAP

    // ✅ Перевірка SMTP
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: email,
        pass: smtpPassword,
      },
    });

    await transporter.verify();

    return { success: true };
  } catch (error) {
    console.error('🔴 Email check failed:', error.message);
    throw new functions.https.HttpsError(
      'failed-precondition',
      'IMAP or SMTP verification failed: ' + error.message
    );
  }
});
