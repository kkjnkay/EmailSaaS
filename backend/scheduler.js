const admin = require('firebase-admin');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');
const sendEmail = require('./utils/sendEmail');
const moment = require('moment');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid'); // npm install uuid
const { replaceMergeTags } = require('./utils/mergeTags'); // 🆕

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = getFirestore();

async function runScheduler() {
  console.log('🔁 Starting scheduler...');

  const campaigns = await db.collection('campaigns')
    .where('status', 'in', ['active', 'running'])
    .get();

  console.log(`📦 Завантажено кампаній: ${campaigns.size}`);

  for (const campaignDoc of campaigns.docs) {
    const campaign = campaignDoc.data();
    const campaignId = campaignDoc.id;

    const { sequences = [], selectedEmails = [], dailyLimit = 10 } = campaign;

    console.log(`🔍 Кампанія "${campaign.name}": sequences=${sequences.length}, selectedEmails=${selectedEmails.length}`);

    if (!sequences.length || !selectedEmails.length) {
      console.log(`⚠️ Кампанія "${campaign.name}" пропущена — немає sequences або selectedEmails`);
      continue;
    }

    const emailAccountsSnapshot = await db.collection('emails').get();
    const emailAccounts = emailAccountsSnapshot.docs
      .filter(doc => selectedEmails.includes(doc.id))
      .map(doc => ({ id: doc.id, ...doc.data(), sent: 0 }));

    console.log(`📥 Завантажуємо ліди для кампанії ${campaign.name}`);
    const leadsSnapshot = await db.collection('leads')
      .where('campaignId', '==', campaignId)
      .where('active', '==', true)
      .get();

    console.log(`👥 Кількість лідов: ${leadsSnapshot.size}`);

    const leadsToSend = [];

    leadsSnapshot.forEach(doc => {
      const lead = doc.data();
      const step = lead.sequenceStep || 0;
      const lastSent = lead.lastSentAt ? moment(lead.lastSentAt.toDate()) : null;
      const delay = sequences[step]?.delayInDays || 0;

      if (step < sequences.length && (!lastSent || moment().diff(lastSent, 'days') >= delay)) {
        leadsToSend.push({ ...lead, id: doc.id, step });
      }
    });

    console.log(`📤 Готово до надсилання: ${leadsToSend.length}`);

    if (!leadsToSend.length) {
      console.log(`⚠️ Кампанія "${campaign.name}": немає лідов до надсилання`);
      continue;
    }

    let sent = 0;

    for (const lead of leadsToSend) {
      if (sent >= dailyLimit) break;

      const sender = emailAccounts.find(e => (e.sent || 0) < (e.limit || 50));
      if (!sender) {
        console.log(`🚫 Немає доступних поштових акаунтів для надсилання`);
        break;
      }

      const step = lead.step;
      const sequence = sequences[step];

      // 🆕 Підстановка даних в subject і body
      const subject = replaceMergeTags(sequence.subject, lead);
      const body = replaceMergeTags(sequence.body, lead);

      const generatedMessageId = `<${uuidv4()}@${sender.smtpHost}>`;

      const transporter = nodemailer.createTransport({
        host: sender.smtpHost,
        port: sender.smtpPort,
        secure: parseInt(sender.smtpPort) === 465,
        auth: {
          user: sender.email,
          pass: sender.smtpPassword,
        },
      });

      const mailOptions = {
        from: sender.email,
        to: lead.email,
        subject,
        text: body,
        messageId: generatedMessageId,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        const usedMessageId = info.messageId || generatedMessageId;

        console.log(`✅ Sent to ${lead.email} via ${sender.email} | msgID=${usedMessageId}`);

        await db.collection('leads').doc(lead.id).update({
          sequenceStep: step + 1,
          lastSentAt: Timestamp.now(),
          messages: admin.firestore.FieldValue.arrayUnion({
            step,
            subject,
            messageId: `<${Math.random().toString(36).substring(2)}@mail.adm.tools>`,
            sentAt: Timestamp.now()
          })
        });

        await db.collection('campaigns').doc(campaignId).update({
          sent: admin.firestore.FieldValue.increment(1),
        });

        await db.collection('emails').doc(sender.id).update({
          dailySentCount: admin.firestore.FieldValue.increment(1),
          dailySentDate: new Date().toISOString().split('T')[0],
        });

        sender.sent++;
        sent++;
      } catch (err) {
        console.error(`❌ Failed to ${lead.email}:`, err.message);
      }
    }
  }

  console.log('✅ Scheduler finished');
}

runScheduler();
