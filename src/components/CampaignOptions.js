import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const CampaignOptions = ({ campaignId }) => {
  const [user] = useAuthState(auth);
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [dailyLimit, setDailyLimit] = useState('');
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const emailSnapshot = await getDocs(collection(db, 'emails'));
      const userEmails = emailSnapshot.docs
        .filter((doc) => doc.data().ownerUid === user?.uid)
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setEmails(userEmails);
      setFilteredEmails(userEmails);

      const campaignSnapshot = await getDoc(doc(db, 'campaigns', campaignId));
      if (campaignSnapshot.exists()) {
        const data = campaignSnapshot.data();
        setSelectedEmails(data.selectedEmails || []);
        setDailyLimit(data.dailyLimit || '');
      }
    };

    if (user) fetchData();
  }, [user, campaignId]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleEmail = (id) => {
    setSelectedEmails((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredEmails(
      emails.filter((email) =>
        email.email.toLowerCase().includes(value)
      )
    );
  };

  const handleSave = async () => {
    await updateDoc(doc(db, 'campaigns', campaignId), {
      selectedEmails,
      dailyLimit: parseInt(dailyLimit) || 0,
    });
    alert('Options saved!');
  };

  return (
    <div className="options-panel" style={{ padding: '1rem', maxWidth: '600px' }}>
      <h3>📤 Select Emails for Sending</h3>
      <div ref={dropdownRef} style={{ position: 'relative', marginBottom: '20px' }}>
        <div
          onClick={() => setDropdownOpen((prev) => !prev)}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
            background: '#f9f9f9',
          }}
        >
          {selectedEmails.length > 0
            ? emails
                .filter(email => selectedEmails.includes(email.id))
                .map(email => email.email)
                .join(', ')
            : 'Click to select emails'}
        </div>
        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              width: '100%',
              maxHeight: '250px',
              overflowY: 'auto',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '6px',
              zIndex: 10,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search emails..."
              style={{
                width: 'calc(95% - 16px)',
                margin: '8px',
                padding: '6px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
            <div style={{ padding: '8px' }}>
              {filteredEmails.map((email) => (
                <label
                  key={email.id}
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    padding: '4px 0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(email.id)}
                    onChange={() => toggleEmail(email.id)}
                    style={{ marginRight: '6px' }}
                  />
                  {email.email}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>📈 Daily Email Limit</h3>
        <input
          type="number"
          value={dailyLimit}
          onChange={(e) => setDailyLimit(e.target.value)}
          placeholder="E.g. 100"
          style={{
            padding: '8px',
            width: '150px',
            borderRadius: '6px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          marginTop: '30px',
          padding: '10px 16px',
          borderRadius: '8px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
        }}
      >
        💾 Save Options
      </button>
    </div>
  );
};

export default CampaignOptions;
