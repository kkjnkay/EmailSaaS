// ✅ EmailList.jsx (оновлений)
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import EmailCard from './EmailCard';
import Modal from './Modal';
import AddEmailForm from './AddEmailForm';
import SettingsSidebar from './SettingsSidebar';
import '../styles/App.css';

const EmailList = () => {
  const [emails, setEmails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'emails'),
      where('ownerUid', '==', auth.currentUser?.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date().toISOString().split('T')[0];
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        const sentToday = data.dailySentDate === today ? (data.dailySentCount || 0) : 0;
        return { id: doc.id, ...data, sentToday };
      });
      setEmails(fetched);
    });

    return () => unsubscribe();
  }, []);

  const handleAddSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="campaign-list">
      <div className="campaigns-header">
        <h2>Emails</h2>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>+ Add New</button>
      </div>

      {emails.length === 0 && <p>No emails yet. Click "+ Add New" to start.</p>}

      {emails.map((email) => (
        <EmailCard
          key={email.id}
          name={email.email}
          sent={email.sentToday}
          limit={email.limit || email.sendLimit || 25}
          onSettings={() => setSelectedEmail(email)}
        />
      ))}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AddEmailForm onSuccess={handleAddSuccess} />
      </Modal>

      {selectedEmail && (
        <SettingsSidebar
          emailData={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  );
};

export default EmailList;
