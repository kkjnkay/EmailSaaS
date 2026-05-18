import React, { useState } from 'react';
import Papa from 'papaparse';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../styles/App.css';

const LeadsUploader = ({ campaignId }) => {
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    // Завантажуємо всі існуючі email цього користувача
    const q = query(collection(db, 'leads'), where('ownerUid', '==', auth.currentUser?.uid));
    const snapshot = await getDocs(q);
    const existingEmails = new Set(snapshot.docs.map(doc => doc.data().email.toLowerCase()));

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const rows = results.data.filter(row => row["Work Email"]);
        const leadsToAdd = [];

        for (const lead of rows) {
          const email = (lead["Work Email"] || '').toLowerCase();
          if (!allowDuplicates && existingEmails.has(email)) continue;

          leadsToAdd.push({
            firstName: lead["First Name"] || '',
            lastName: lead["Last Name"] || '',
            jobTitle: lead["Job Title"] || '',
            location: lead["Location"] || '',
            linkedin: lead["LinkedIn Profile"] || '',
            email,
            ownerUid: auth.currentUser?.uid,
            campaignId,
            stopped: false,
            createdAt: serverTimestamp(),
          });
        }

        // Додаємо всі допустимі ліди
        for (const lead of leadsToAdd) {
          try {
            await addDoc(collection(db, 'leads'), lead);
          } catch (err) {
            console.error("❌ Error saving lead:", err);
          }
        }

        alert(`✅ Завантажено ${leadsToAdd.length} лідів${!allowDuplicates ? ' (дублікати пропущені)' : ''}.`);
        setLoading(false);
      },
      error: (error) => {
        console.error("CSV parsing failed:", error);
        alert("⛔ Помилка при обробці CSV.");
        setLoading(false);
      }
    });
  };

  return (
    <div className="upload-section">
      <label className="upload-label">
        Upload CSV with leads:
        <input type="file" accept=".csv" onChange={handleFile} disabled={loading} />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
        <input
          type="checkbox"
          checked={allowDuplicates}
          onChange={(e) => setAllowDuplicates(e.target.checked)}
        />
        Allow duplicate leads
      </label>
    </div>
  );
};

export default LeadsUploader;
