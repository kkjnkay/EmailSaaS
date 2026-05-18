import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../styles/Unibox.css';
import Sidebar from '../components/Sidebar';

const Unibox = () => {
  const [replies, setReplies] = useState([]);
  const [selectedReply, setSelectedReply] = useState(null);
  const [campaignSubjects, setCampaignSubjects] = useState([]);
  const [tab, setTab] = useState('primary');

// Завантаження campaignSubjects із steps у campaigns
useEffect(() => {
  const loadSubjects = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(collection(db, 'campaigns'), where('ownerUid', '==', uid));
    const snapshot = await getDocs(q);
    const subjects = [];

    snapshot.docs.forEach(doc => {
      const steps = doc.data().sequences || [];
      steps.forEach(step => {
        if (step.subject) {
          subjects.push(step.subject.toLowerCase().trim());
        }
      });
    });

    setCampaignSubjects(subjects);
  };

  loadSubjects();
}, [auth.currentUser]);


  // Отримання відповідей
  useEffect(() => {
    if (!auth.currentUser?.uid) return;

    const q = query(
      collection(db, 'replies'),
      where('ownerUid', '==', auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, snapshot => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.receivedAt?.toDate)
        .sort((a, b) => b.receivedAt.toDate() - a.receivedAt.toDate());

      setReplies(data);
    });

    return () => unsub();
  }, [auth.currentUser]);

  const isPrimaryReply = (reply) => {
    if (!reply.subject) return false;
    const replySubject = reply.subject.toLowerCase().trim();
    return campaignSubjects.some(campaignSubject =>
      replySubject.includes(campaignSubject)
    );
  };

  const filteredReplies = tab === 'primary'
    ? replies.filter(isPrimaryReply)
    : replies.filter(reply => !isPrimaryReply(reply));

  const handleSelect = (reply) => {
    setSelectedReply(reply);
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    const options = { day: 'numeric', month: 'long' };
    const time = date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${date.toLocaleDateString('uk-UA', options)} ${time}`;
  };

  return (
    <div className="unibox-container">
      <Sidebar />

      <div className="unibox-main">
        <div className="tab-switch">
          <button
            className={tab === 'primary' ? 'active' : ''}
            onClick={() => setTab('primary')}
          >
            📥 Primary
          </button>
          <button
            className={tab === 'others' ? 'active' : ''}
            onClick={() => setTab('others')}
          >
            📂 Others
          </button>
        </div>

        <div className="unibox-body">
          <div className="unibox-list">
            {filteredReplies.map(reply => (
              <div
                key={reply.id}
                className={`unibox-item ${selectedReply?.id === reply.id ? 'selected' : ''}`}
                onClick={() => handleSelect(reply)}
              >
                <div className="item-header">
                  <strong>{reply.from}</strong>
                  {reply.receivedAt && (
                    <span className="received-at">{formatDate(reply.receivedAt)}</span>
                  )}
                </div>
                <div className="reply-to">{reply.to}</div>
                <div><strong>{reply.subject}</strong></div>
                <div className="unibox-snippet">{reply.body?.slice(0, 100)}...</div>
              </div>
            ))}
          </div>

          <div className="unibox-detail">
            {selectedReply ? (
              <>
                <div className="reply-header">
                  <h3>📥 Reply from: {selectedReply.from}</h3>
                  <p><strong>To:</strong> {selectedReply.to}</p>
                  <p><strong>Subject:</strong> {selectedReply.subject}</p>
                  {selectedReply.receivedAt && (
                    <p><strong>Received:</strong> {formatDate(selectedReply.receivedAt)}</p>
                  )}
                </div>
                <div className="reply-body">
                  <pre>{selectedReply.body}</pre>
                </div>
              </>
            ) : (
              <p style={{ padding: '20px' }}>Select a reply to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unibox;
