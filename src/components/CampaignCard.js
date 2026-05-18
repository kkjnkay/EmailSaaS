// src/components/CampaignCard.js

import React from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';

const CampaignCard = ({ id, name, leads, sent, replies, status }) => {
  const navigate = useNavigate();

  const toggleStatus = async () => {
    const ref = doc(db, 'campaigns', id);
    const newStatus = status === 'running' ? 'paused' : 'running';
    await updateDoc(ref, { status: newStatus });
  };

  const goToSettings = () => {
    navigate(`/campaigns/${id}/settings`);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete campaign "${name}"?`);
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'campaigns', id));
      alert('Campaign deleted!');
    } catch (err) {
      console.error('Error deleting campaign:', err.message);
      alert('Failed to delete campaign.');
    }
  };

  return (
    <div className="campaign-card">
      <div className="campaign-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{name}</h3>
        <span className={`status-tag ${status}`}>{status}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="gear-button" onClick={goToSettings}>⚙️</button>
          <button className="delete-button" onClick={handleDelete}>🗑</button>
        </div>
      </div>
      <div className="campaign-stats">
        <p>📨 Leads: {leads}</p>
        <p>✅ Sent: {sent}</p>
        <p>💬 Replies: {replies}</p>
      </div>
      <button
        className="status-button"
        onClick={toggleStatus}
        style={{
          marginTop: '10px',
          padding: '6px 12px',
          backgroundColor: status === 'running' ? '#fbbf24' : '#4ade80',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        {status === 'running' ? '⏸ Pause' : '▶️ Start'}
      </button>
    </div>
  );
};

export default CampaignCard;
