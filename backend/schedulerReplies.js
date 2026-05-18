'use strict';

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const moment = require('moment');
const { Readable } = require('stream');

// Ініціалізація Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = getFirestore();

// Утиліта для конвертації string → stream
function stringToStream(str) {
  const stream = new Readable();
  stream.push(str);
  stream.push(null);
  return stream;
}

// Нормалізація теми листа
function normalizeSubject(subject = '') {
  return subject
    .toLowerCase()
    .replace(/^(re|fwd):\s*/i, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\x00-\x7F]/g, '')
    .trim();
}

async function fetchReplies() {
  const emailDocs = await db.collection('emails').get();
  const emailAccounts = emailDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  for (const acc of emailAccounts) {
    console.log(`📬 Connecting to ${acc.email}...`);

    const sinceDate = acc.lastCheckedReplies || moment().subtract(2, 'days').toDate();
    const sinceStr = moment(sinceDate).format('DD-MMM-YYYY');

    const config = {
      imap: {
        user: acc.email,
        password: acc.imapPassword,
        host: acc.imapHost,
        port: parseInt(acc.imapPort),
        tls: true,
        authTimeout: 10000,
      },
    };

    try {
      const connection = await imaps.connect(config);
      await connection.openBox('INBOX');

      const searchCriteria = [['SINCE', sinceStr]];
      const fetchOptions = {
        bodies: [''],
        struct: true,
        markSeen: false,
      };

      const msgs = await connection.search(searchCriteria, fetchOptions);
      console.log(`🔍 Found ${msgs.length} messages in ${acc.email}`);

      for (const m of msgs) {
        const allParts = imaps.getParts(m.attributes.struct);
        const bodyPart = allParts.find(part => part.type === 'text' && part.subtype === 'plain');

        let body = '';
        if (bodyPart) {
          const partData = await connection.getPartData(m, bodyPart);
          body = partData || '';
        }

        const headersPart = m.parts.find(p => p.which === '');
        let parsed = { subject: '', from: [], to: [], date: new Date() };
        if (headersPart && headersPart.body) {
          parsed = await simpleParser(stringToStream(headersPart.body));
        }

        const fromAddr = parsed.from?.value?.[0]?.address?.toLowerCase() || 'unknown';
        const toList = (parsed.to?.value || []).map(a => a.address?.toLowerCase()).filter(Boolean);
        const subject = parsed.subject || '';
        const normalized = normalizeSubject(subject);
        const arrived = parsed.date || new Date();

        console.log(`▶ ${arrived.toISOString()} | from: ${fromAddr} | to: ${toList.join(', ')} | sub: ${subject}`);

        if (arrived <= sinceDate) {
          console.log('⏩ Skipped (old message)');
          continue;
        }

        const isIncoming = toList.includes(acc.email.toLowerCase()) && fromAddr !== acc.email.toLowerCase();
        if (!isIncoming) {
          console.log(`⏩ Outgoing / not‑to‑me skipped («${subject}» from ${fromAddr})`);
          continue;
        }

        // 🔧 Отримуємо campaignId (якщо знайдемо відповідність)
        let matchedCampaignId = null;
        if (acc.ownerUid) {
          const campaignsSnap = await db
            .collection('campaigns')
            .where('ownerUid', '==', acc.ownerUid)
            .get();

          for (const doc of campaignsSnap.docs) {
            const data = doc.data();
            const steps = data.sequences || [];

            for (const step of steps) {
              const stepSubject = step.subject?.toLowerCase()?.trim();
              if (stepSubject && stepSubject === normalized) {
                matchedCampaignId = doc.id;
                break;
              }
            }

            if (matchedCampaignId) break;
          }
        }

        // 🔧 Зберігаємо відповідь із campaignId
        await db.collection('replies').add({
          from: fromAddr,
          to: toList.join(', '),
          subject,
          subjectNormalized: normalized,
          body,
          receivedAt: arrived,
          emailAccount: acc.email,
          ownerUid: acc.ownerUid || null,
          campaignId: matchedCampaignId || null, // 👈 додаємо сюди
        });

        console.log('✅ Saved incoming reply');
      }

      await db.collection('emails').doc(acc.id).update({
        lastCheckedReplies: new Date(),
      });

      await connection.end();
    } catch (err) {
      console.error(`❌ IMAP error for ${acc.email}:`, err.message);
    }
  }

  console.log('🏁 Finished fetching incoming replies');
}

fetchReplies();
