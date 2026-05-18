import React, { useState } from 'react';
import '../styles/App.css';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SettingsSidebar = ({ emailData, onClose }) => {
  const [form, setForm] = useState({
    firstName: emailData.firstName || '',
    lastName: emailData.lastName || '',
    sendLimit: emailData.sendLimit || 25,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, 'emails', emailData.id);
      await updateDoc(docRef, {
        firstName: form.firstName,
        lastName: form.lastName,
        sendLimit: Number(form.sendLimit),
      });
      onClose();
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update email');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this email account?')) {
      try {
        const docRef = doc(db, 'emails', emailData.id);
        await deleteDoc(docRef);
        onClose();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete');
      }
    }
  };

  return (
    <div className="sidebar-modal">
      <div className="sidebar-modal-header">
        <h3>Settings</h3>
        <button onClick={onClose}>×</button>
      </div>
      <div className="sidebar-modal-body">
        <label>First Name:</label>
        <input name="firstName" value={form.firstName} onChange={handleChange} />

        <label>Last Name:</label>
        <input name="lastName" value={form.lastName} onChange={handleChange} />

        <label>Daily Send Limit:</label>
        <input name="sendLimit" type="number" value={form.sendLimit} onChange={handleChange} />

        <button className="save-btn" onClick={handleSave}>💾 Save</button>
        <button className="delete-btn" onClick={handleDelete}>🗑 Delete</button>
      </div>
    </div>
  );
};

export default SettingsSidebar;
