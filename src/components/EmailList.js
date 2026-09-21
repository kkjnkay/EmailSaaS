import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import EmailCard from './EmailCard';
import Modal from './Modal';
import AddEmailForm from './AddEmailForm';
import SettingsSidebar from './SettingsSidebar';
import GmailHelpModal from './GmailHelpModal';

const EmailList = () => {
  const [emails, setEmails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
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
      <div className="campaigns-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2>Поштові акаунти</h2>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setIsHelpModalOpen(true)}
            style={{ 
              background: '#f8fafc', color: 'var(--text-main)', 
              border: '1px solid #e2e8f0', padding: '10px 16px', 
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', 
              fontWeight: '600', fontSize: '14px', transition: 'var(--transition)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <span>💡</span> Інструкція
          </button>

          <button className="add-button" onClick={() => setIsModalOpen(true)}>
            + Додати Gmail
          </button>
        </div>
      </div>

      {emails.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px dashed #cbd5e1', marginTop: '20px' }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>📧</span>
          <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px' }}>Немає підключених акаунтів</h3>
          <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Натисніть "+ Додати Gmail", щоб почати роботу.</p>
        </div>
      )}

      {emails.map((email) => (
        <EmailCard
          key={email.id}
          name={email.email}
          sent={email.sentToday}
          onSettings={() => setSelectedEmail(email)}
        />
      ))}

      {/* Модалка для додавання пошти */}
      <AddEmailForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleAddSuccess} 
      />

      {/* Наша нова преміальна модалка з інструкцією */}
      {isHelpModalOpen && (
        <GmailHelpModal onClose={() => setIsHelpModalOpen(false)} />
      )}

      {/* Налаштування існуючої пошти */}
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