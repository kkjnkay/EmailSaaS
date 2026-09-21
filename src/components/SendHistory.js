import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

const SendHistory = ({ campaignId }) => {
  const [logs, setLogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    // Шукаємо логи тільки для цієї кампанії
    const q = query(
      collection(db, 'send_logs'),
      where('campaignId', '==', campaignId),
      where('ownerUid', '==', auth.currentUser?.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Сортуємо на клієнті від новіших до старіших, щоб уникнути помилок з відсутніми індексами у Firestore
      fetchedLogs.sort((a, b) => {
        const timeA = a.sentAt?.toMillis() || Date.now();
        const timeB = b.sentAt?.toMillis() || Date.now();
        return timeB - timeA;
      });
      setLogs(fetchedLogs);
    });

    return () => unsubscribe();
  }, [campaignId]);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  if (logs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px dashed #cbd5e1' }}>
        <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>📭</span>
        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '20px' }}>Історія порожня</h3>
        <p style={{ marginTop: '8px' }}>Ви ще не відправляли листи в рамках цієї кампанії.</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Дата та час</th>
            <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Отримувач</th>
            <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Email</th>
            <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Статус</th>
            <th style={{ padding: '16px 20px', textAlign: 'right' }}></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const dateStr = log.sentAt ? log.sentAt.toDate().toLocaleString('uk-UA', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }) : 'Щойно';

            return (
              <React.Fragment key={log.id}>
                <tr 
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s', cursor: 'pointer', backgroundColor: isExpanded ? '#f8fafc' : 'white' }} 
                  onClick={() => toggleExpand(log.id)}
                  onMouseOver={(e) => !isExpanded && (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseOut={(e) => !isExpanded && (e.currentTarget.style.backgroundColor = 'white')}
                >
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-muted)' }}>{dateStr}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: 'var(--text-main)' }}>{log.recipientName}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>{log.recipientEmail}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ color: '#047857', fontWeight: 'bold', fontSize: '12px', background: '#d1fae5', padding: '4px 10px', borderRadius: '20px' }}>
                      ✅ Надіслано
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '14px' }}>
                      {isExpanded ? 'Згорнути ▲' : 'Переглянути ▼'}
                    </span>
                  </td>
                </tr>
                
                {/* 📝 Розгорнутий вигляд самого листа */}
                {isExpanded && (
                  <tr>
                    <td colSpan="5" style={{ padding: '0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ padding: '24px 40px', borderLeft: '4px solid var(--primary)', animation: 'fadeIn 0.3s ease-out' }}>
                        <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Вміст надісланого листа:</h4>
                        <div 
                          style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}
                          dangerouslySetInnerHTML={{ __html: log.htmlContent }} 
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SendHistory;