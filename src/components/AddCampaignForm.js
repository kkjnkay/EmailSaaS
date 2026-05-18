import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../styles/App.css';

const AddCampaignForm = ({ onSuccess }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await addDoc(collection(db, 'campaigns'), {
        name,
        status: 'draft',
        leadsCount: 0,
        sent: 0,
        replies: 0,
        ownerUid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setName('');
      onSuccess();
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert('Failed to create campaign');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="email-form">
      <h3>New Campaign</h3>
      <input
        placeholder="Campaign name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit">Create</button>
    </form>
  );
};

export default AddCampaignForm;
