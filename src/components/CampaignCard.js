import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const CampaignCard = ({ id, name, leads, sent }) => {
  const navigate = useNavigate();
  
  // Стани для кастомного вікна підтвердження видалення
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const goToSettings = () => {
    navigate(`/campaigns/${id}/settings`);
  };

  const openDeleteModal = (e) => {
    e.stopPropagation(); // Зупиняємо перехід у налаштування при кліку на кнопку видалення
    setIsDeleteModalOpen(true);
    setIsClosing(false);
  };

  const closeDeleteModal = (e) => {
    if (e) e.stopPropagation();
    setIsClosing(true);
    setTimeout(() => {
      setIsDeleteModalOpen(false);
    }, 250);
  };

  const confirmDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'campaigns', id));
      closeDeleteModal();
    } catch (err) {
      console.error('Помилка при видаленні кампанії:', err.message);
      alert('Не вдалося видалити кампанію.');
    }
  };

  return (
    <>
      <div className="campaign-card">
        <div className="campaign-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', width: '100%' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--bg-sidebar)', margin: 0 }}>{name}</h3>
          
          <button 
            onClick={openDeleteModal} 
            title="Видалити кампанію"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              background: '#fee2e2', 
              color: '#ef4444',
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        
        <div className="campaign-stats" style={{ display: 'flex', gap: '24px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>👥</span>
            <span><strong>{leads}</strong> викладачів</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <span><strong>{sent || 0}</strong> відправлено</span>
          </div>
        </div>

        <button
          onClick={goToSettings}
          style={{
            marginTop: '20px',
            padding: '12px',
            width: '100%',
            backgroundColor: '#eff6ff',
            color: 'var(--primary)',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'var(--transition)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'var(--primary)';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#eff6ff';
            e.target.style.color = 'var(--primary)';
          }}
        >
          Відкрити кампанію →
        </button>
      </div>

      {/* 🔥 Преміальне модальне вікно підтвердження видалення кампанії */}
      {isDeleteModalOpen && (
        <div 
          onClick={closeDeleteModal} 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999,
            animation: `${isClosing ? 'backdropExit' : 'backdropEnter'} 0.25s ease-out forwards`
          }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{
              width: '100%', maxWidth: '380px',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px 32px 32px 32px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(239, 68, 68, 0.1)',
              animation: `${isClosing ? 'modalExit' : 'modalEnter'} 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
              textAlign: 'center'
            }}
          >
            {/* Літаюча іконка кошика */}
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
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--bg-sidebar)', marginTop: '24px', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Видалення розсилки
            </h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px', lineHeight: '1.5', padding: '0 4px' }}>
              Ви справді хочете видалити кампанію <strong style={{ color: '#0f172a' }}>"{name}"</strong>? Усі прив'язані списки викладачів та завантажені налаштування буде стерто.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={closeDeleteModal}
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
                onClick={confirmDelete}
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
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CampaignCard;