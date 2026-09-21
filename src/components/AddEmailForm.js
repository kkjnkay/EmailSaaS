import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const AddEmailForm = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPassword = password.replace(/\s/g, '');

    if (cleanPassword.length !== 16) {
      setError('Пароль додатка має містити рівно 16 символів. Перевірте, чи правильно ви його скопіювали з Google.');
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'emails'), {
        email,
        firstName: name, // Використовуємо поле firstName як в SettingsSidebar
        lastName: '',
        smtpPassword: cleanPassword, // Зберігаємо як smtpPassword, бо цього чекає бекенд
        ownerUid: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
        dailySentDate: new Date().toISOString().split('T')[0],
        dailySentCount: 0,
        status: 'active'
      });

      setEmail('');
      setName('');
      setPassword('');
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      console.error("Помилка додавання пошти:", err);
      setError('Не вдалося підключити пошту. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  const inputStyle = {
    width: '100%', padding: '14px 16px', background: '#f8fafc', border: '2px solid transparent',
    borderRadius: '12px', fontSize: '15px', color: '#0f172a', transition: 'all 0.2s ease', boxSizing: 'border-box'
  };

  return (
    <>
      <div 
        onClick={handleClose} 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          animation: `${isClosing ? 'backdropExit' : 'backdropEnter'} 0.25s ease-out forwards`
        }}
      >
        <div 
          onClick={e => e.stopPropagation()} 
          style={{
            width: '100%', maxWidth: '480px', background: '#ffffff',
            borderRadius: '24px', padding: '40px 32px 32px', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(79, 70, 229, 0.1)',
            animation: `${isClosing ? 'modalExit' : 'modalEnter'} 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards`
          }}
        >
          <div style={{
            position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
            width: '64px', height: '64px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', rotate: '-3deg'
          }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
          
          <button 
            onClick={handleClose}
            style={{
              position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none',
              width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
          >
            ✕
          </button>

          <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Підключення Gmail
            </h3>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px', borderRadius: '12px', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: '#64748b', marginLeft: '4px' }}>Відображуване ім'я</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр. Дирекція Інституту" style={inputStyle}
                onFocus={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)'; }}
                onBlur={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: '#64748b', marginLeft: '4px' }}>Електронна пошта</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@lpnu.ua" style={inputStyle}
                onFocus={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)'; }}
                onBlur={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: '#64748b', marginLeft: '4px' }}>Пароль додатка (16 символів)</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="•••• •••• •••• ••••" style={inputStyle}
                onFocus={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)'; }}
                onBlur={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                width: '100%', padding: '16px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 
                color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', 
                cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s', marginTop: '10px'
              }}
              onMouseOver={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {isSubmitting ? 'Підключення...' : 'Зберегти пошту'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddEmailForm;