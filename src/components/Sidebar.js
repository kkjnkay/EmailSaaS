import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const navItems = [
  { icon: '📤', label: 'Кампанії', path: '/campaigns' },
  { icon: '📧', label: 'Пошти', path: '/emails' },
  { icon: '👥', label: 'Викладачі', path: '/leads' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Стани для кастомного вікна виходу
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
    setIsClosing(false);
  };

  const closeLogoutModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsLogoutModalOpen(false);
    }, 250);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Помилка при виході:', error);
      alert('Не вдалося вийти з акаунту.');
    }
  };

  return (
    <>
      {/* Додаємо стилі анімацій прямо сюди, щоб вони працювали незалежно */}
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

      <div className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        
        <div className="sidebar-icons" style={{ width: '100%' }}>
          {navItems.map((item, index) => (
            <div
              key={index}
              className="tooltip-container"
              onClick={() => navigate(item.path)}
            >
              <div className={`sidebar-icon ${location.pathname === item.path ? 'active' : ''}`}>
                {item.icon}
              </div>
              <span className="tooltip-text">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Кнопка виходу */}
        <div style={{ marginTop: 'auto', marginBottom: '30px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div className="tooltip-container" onClick={openLogoutModal}>
            <div 
              className="sidebar-icon"
              style={{ 
                color: '#94a3b8', 
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
              onMouseOver={e => { 
                e.currentTarget.style.backgroundColor = '#fee2e2'; 
                e.currentTarget.style.color = '#ef4444'; 
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={e => { 
                e.currentTarget.style.backgroundColor = 'transparent'; 
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            <span className="tooltip-text">Вийти з системи</span>
          </div>
        </div>
      </div>

      {/* 🔥 Преміальне модальне вікно підтвердження виходу */}
      {isLogoutModalOpen && (
        <div 
          onClick={closeLogoutModal} 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999,
            animation: `${isClosing ? 'backdropExit' : 'backdropEnter'} 0.25s ease-out forwards`
          }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{
              width: '100%', maxWidth: '360px',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(239, 68, 68, 0.1)',
              animation: `${isClosing ? 'modalExit' : 'modalEnter'} 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
              textAlign: 'center'
            }}
          >
            {/* Літаюча іконка */}
            <div style={{
              position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)',
              width: '56px', height: '56px',
              background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              boxShadow: '0 10px 25px rgba(220, 38, 38, 0.4)',
              rotate: '-3deg'
            }}>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--bg-sidebar)', marginTop: '20px', marginBottom: '8px' }}>
              Вихід з системи
            </h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px', lineHeight: '1.5' }}>
              Ви дійсно хочете вийти зі свого акаунту? Вам доведеться знову пройти авторизацію через Google.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={closeLogoutModal}
                style={{
                  flex: 1, padding: '12px',
                  background: '#f1f5f9', color: 'var(--text-main)',
                  border: 'none', borderRadius: '12px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                Скасувати
              </button>
              
              <button 
                onClick={confirmLogout}
                style={{
                  flex: 1, padding: '12px',
                  background: '#ef4444', color: 'white',
                  border: 'none', borderRadius: '12px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Вийти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;