import React from 'react';

const EmailCard = ({ name, sent, onSettings }) => {
  return (
    <div className="campaign-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="campaign-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--bg-sidebar)', margin: 0 }}>{name}</h3>
        
        {/* Сучасна кнопка налаштувань у правій частині картки */}
        <button 
          onClick={onSettings} 
          title="Налаштування пошти"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            background: '#f1f5f9', 
            color: '#475569',
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.color = '#475569';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
      
      <div className="campaign-stats" style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📨</span>
          <span>Відправлено сьогодні: <strong style={{ color: 'var(--text-main)' }}>{sent || 0}</strong> листів</span>
        </div>
      </div>
    </div>
  );
};

export default EmailCard;