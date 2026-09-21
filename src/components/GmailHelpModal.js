import React, { useState, useEffect } from 'react';

const GmailHelpModal = ({ onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 250); // Чекаємо завершення анімації
  };

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
        `}
      </style>

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
        <div 
          onClick={e => e.stopPropagation()} 
          style={{
            width: '100%', maxWidth: '500px',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '40px 32px 32px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(79, 70, 229, 0.1)',
            animation: `${isClosing ? 'modalExit' : 'modalEnter'} 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards`
          }}
        >
          {/* Літаюча іконка */}
          <div style={{
            position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
            rotate: '-3deg'
          }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          
          {/* Кнопка закриття */}
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

          <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--bg-sidebar)', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              Як отримати пароль?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              Коротка інструкція для підключення Gmail
            </p>
          </div>

          <ol style={{ paddingLeft: '20px', margin: '0 0 24px 0', lineHeight: '1.7', color: 'var(--text-main)', fontSize: '14px' }}>
            <li style={{ marginBottom: '8px' }}>Перейдіть у налаштування свого <strong>Google Акаунту</strong> (myaccount.google.com).</li>
            <li style={{ marginBottom: '8px' }}>Відкрийте розділ <strong>"Безпека" (Security)</strong>.</li>
            <li style={{ marginBottom: '8px' }}>Переконайтеся, що у вас увімкнена <strong>Двоетапна перевірка</strong>.</li>
            <li style={{ marginBottom: '8px' }}>У рядку пошуку вгорі введіть <strong>"Паролі додатків" (App passwords)</strong>.</li>
            <li style={{ marginBottom: '8px' }}>Створіть новий пароль, назвавши його "UniSync".</li>
            <li><strong>Скопіюйте згенерований 16-значний код</strong> та вставте його при додаванні пошти, попередньо прибравши пробіли між цифрами.</li>
          </ol>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '12px', fontSize: '13px', color: '#92400e', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <strong>Важливо:</strong> Google покаже цей пароль лише один раз. Його не потрібно запам'ятовувати, просто скопіюйте і вставте у нашу систему.
            </div>
          </div>

          <button 
            onClick={handleClose}
            style={{ 
              width: '100%', padding: '14px', marginTop: '24px',
              background: '#f1f5f9', color: 'var(--text-main)', 
              border: 'none', borderRadius: '12px', 
              fontSize: '15px', fontWeight: '700', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; }}
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </>
  );
};

export default GmailHelpModal;