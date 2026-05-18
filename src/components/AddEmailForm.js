import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../styles/App.css';

const AddEmailForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    imapPassword: '',
    imapHost: '',
    imapPort: '',
    smtpPassword: '',
    smtpHost: '',
    smtpPort: ''
  });

  const [checking, setChecking] = useState(false);
  const [checkSuccess, setCheckSuccess] = useState(null); // null | true | false

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setCheckSuccess(null); // скидаємо перевірку при зміні
  };

  const handleCheckConnection = async () => {
    setChecking(true);
    try {
      const response = await fetch('http://localhost:3001/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          imapHost: form.imapHost,
          imapPort: form.imapPort,
          imapPassword: form.imapPassword,
          smtpHost: form.smtpHost,
          smtpPort: form.smtpPort,
          smtpPassword: form.smtpPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        setCheckSuccess(true);
      } else {
        setCheckSuccess(false);
      }
    } catch (err) {
      setCheckSuccess(false);
    }
    setChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkSuccess) {
      alert('Спочатку виконайте успішну перевірку підключення');
      return;
    }
    try {
      await addDoc(collection(db, 'emails'), {
        ...form,
        ownerUid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        lastCheckedReplies: serverTimestamp() // автоматична відмітка часу при додаванні
      });
      alert('✅ Пошта додана!');
      onSuccess();
    } catch (error) {
      console.error('Error adding email:', error);
      alert('❌ Помилка при додаванні пошти');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="email-form">
      <h3>Add Email Account</h3>
      <div className="form-row">
        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          required
        />
        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          required
        />
      </div>
      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="imapPassword"
        placeholder="IMAP Password"
        value={form.imapPassword}
        onChange={handleChange}
        required
      />
      <input
        name="imapHost"
        placeholder="IMAP Host"
        value={form.imapHost}
        onChange={handleChange}
        required
      />
      <input
        name="imapPort"
        placeholder="IMAP Port"
        value={form.imapPort}
        onChange={handleChange}
        required
      />
      <input
        name="smtpPassword"
        placeholder="SMTP Password"
        value={form.smtpPassword}
        onChange={handleChange}
        required
      />
      <input
        name="smtpHost"
        placeholder="SMTP Host"
        value={form.smtpHost}
        onChange={handleChange}
        required
      />
      <input
        name="smtpPort"
        placeholder="SMTP Port"
        value={form.smtpPort}
        onChange={handleChange}
        required
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
        <button type="button" onClick={handleCheckConnection}>
          {checking ? '🔄 Перевірка...' : '🔍 Перевірити з\'єднання'}
        </button>
        <button type="submit" disabled={!checkSuccess}>
          💾 Додати пошту
        </button>
      </div>

      {checkSuccess === true && (
        <p style={{ color: 'green' }}>✅ З'єднання успішне</p>
      )}
      {checkSuccess === false && (
        <p style={{ color: 'red' }}>❌ Помилка з'єднання</p>
      )}
    </form>
  );
};

export default AddEmailForm;
