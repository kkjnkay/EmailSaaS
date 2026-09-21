import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

const AddCampaignForm = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Блокування скролу фону
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
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'campaigns'), {
        name: name.trim(),
        status: 'draft',
        leadsCount: 0,
        sent: 0,
        replies: 0,
        ownerUid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setName('');
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      console.error('Помилка створення кампанії:', err);
      alert('Не вдалося створити кампанію');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      <style>
        {`
          @keyframes modalEnter { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          @keyframes modalExit { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.9) translateY(20px); } }
          @keyframes backdropEnter { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(8px); } }
          @keyframes backdropExit { from { opacity: 1; backdrop-filter: blur(8px); } to { opacity: 0; backdrop-filter: blur(0px); } }
        `}
      </style>
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
            width: '100%', maxWidth: '420px', background: '#ffffff',
            borderRadius: '24px', padding: '40px 32px 32px', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(79, 70, 229, 0.1)',
            animation: `${isClosing ? 'modalExit' : 'modalEnter'} 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards`
          }}
        >
          <div style={{
            position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
            width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--primary) 0%, #3730a3 100%)',
            borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)', rotate: '3deg', fontSize: '28px'
          }}>
            📋
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

          <div style={{ textAlign: 'center', marginBottom: '28px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Нова розсилка
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Введіть назву для групи навантаження</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: '#64748b', marginLeft: '4px' }}>
                Назва кампанії
              </label>
              <input
                type="text"
                placeholder="напр. Навантаження Осінь 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 16px', background: '#f8fafc', border: '2px solid transparent',
                  borderRadius: '12px', fontSize: '15px', color: '#0f172a', transition: 'all 0.2s ease', boxSizing: 'border-box'
                }}
                onFocus={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.15)'; }}
                onBlur={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                width: '100%', padding: '16px', background: 'linear-gradient(135deg, var(--primary) 0%, #3730a3 100%)', 
                color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', 
                cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
              }}
              onMouseOver={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {isSubmitting ? 'Створення...' : 'Створити кампанію'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddCampaignForm;