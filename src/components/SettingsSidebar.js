import React, { useState, useEffect } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SettingsSidebar = ({ emailData, onClose }) => {
  const [form, setForm] = useState({
    firstName: emailData.firstName || '',
    lastName: emailData.lastName || '',
  });
  const [isClosing, setIsClosing] = useState(false);

  // Плавне закриття модалки
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 250); // Чекаємо, поки програється анімація зникнення
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, 'emails', emailData.id);
      await updateDoc(docRef, {
        firstName: form.firstName,
        lastName: form.lastName,
      });
      handleClose();
    } catch (err) {
      console.error('Update error:', err);
      alert('Не вдалося зберегти зміни.');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Ви впевнені, що хочете видалити цей поштовий акаунт із системи?');
    if (!confirmed) return;

    try {
      const docRef = doc(db, 'emails', emailData.id);
      await deleteDoc(docRef);
      handleClose();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Не вдалося видалити акаунт.');
    }
  };

  // Блокуємо скрол фону, поки відкрита модалка
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes modalEnter {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes modalExit {
            from { opacity: 1; transform: scale(1) translateY(0); }
            to { opacity: 0; transform: scale(0.9) translateY(20px); }
          }
          @keyframes backdropEnter {
            from { opacity: 0; backdrop-filter: blur(0px); }
            to { opacity: 1; backdrop-filter: blur(8px); }
          }
          @keyframes backdropExit {
            from { opacity: 1; backdrop-filter: blur(8px); }
            to { opacity: 0; backdrop-filter: blur(0px); }
          }
          .premium-input {
            width: 100%;
            padding: 14px 16px;
            background: #f8fafc;
            border: 2px solid transparent;
            border-radius: 12px;
            font-size: 15px;
            color: var(--text-main);
            transition: all 0.2s ease;
            box-sizing: border-box;
          }
          .premium-input:focus {
            background: #ffffff;
            border-color: var(--primary);
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
            outline: none;
          }
        `}
      </style>

      {/* Темний фон з ефектом скла */}
      <div 
        onClick={handleClose} 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
          animation: `${isClosing ? 'backdropExit' : 'backdropEnter'} 0.25s ease-out forwards`
        }}
      >
        {/* Сама картка модального вікна */}
        <div 
          onClick={e => e.stopPropagation()} 
          style={{
            width: '100%', maxWidth: '420px',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '40px 32px 32px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(79, 70, 229, 0.1)',
            animation: `${isClosing ? 'modalExit' : 'modalEnter'} 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards`
          }}
        >
          {/* Літаюча іконка зверху (Absolute) */}
          <div style={{
            position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #3730a3 100%)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
            rotate: '-3deg'
          }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          
          {/* Кнопка закриття (Хрестик) */}
          <button 
            onClick={handleClose}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: '#f1f5f9', border: 'none',
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ✕
          </button>

          {/* Заголовок */}
          <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--bg-sidebar)', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
              Профіль пошти
            </h3>
            <div style={{ 
              display: 'inline-block', background: '#f8fafc', border: '1px solid #e2e8f0', 
              padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' 
            }}>
              {emailData.email}
            </div>
          </div>

          {/* Інпути */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                Ім'я відправника
              </label>
              <input 
                name="firstName" 
                type="text"
                value={form.firstName} 
                onChange={handleChange} 
                className="premium-input"
                placeholder="напр. Василь"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                Прізвище відправника
              </label>
              <input 
                name="lastName" 
                type="text"
                value={form.lastName} 
                onChange={handleChange} 
                className="premium-input"
                placeholder="напр. Роїк"
              />
            </div>
          </div>

          {/* Кнопки дій */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={handleSave} 
              style={{ 
                width: '100%', padding: '16px', 
                background: 'linear-gradient(135deg, var(--primary) 0%, #3730a3 100%)', 
                color: 'white', border: 'none', borderRadius: '12px', 
                fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              💾 Зберегти зміни
            </button>
            
            <button 
              onClick={handleDelete} 
              style={{ 
                width: '100%', padding: '14px', 
                background: 'transparent', color: '#ef4444', 
                border: '2px solid transparent', borderRadius: '12px', 
                fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              Видалити акаунт
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsSidebar;