import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import '../styles/landing.css';

const LandingPage = () => {
  const signIn = () => {
    signInWithPopup(auth, provider).catch(console.error);
  };

  return (
    <div className="landing-page">
      <div className="landing-form-container">
        {/* Іконка бренду */}
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚀</div>
        
        <h1>UniSync</h1>
        <p>Автоматизуй розподіл навантаження за секунди</p>
        
        <button className="google-btn" onClick={signIn}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
            alt="Google" style={{ width: '20px' }} 
          />
          Продовжити з Google
        </button>

        <p style={{ fontSize: '12px', marginTop: '24px', color: '#94a3b8' }}>
          Входячи в систему, ви погоджуєтесь з правилами використання сервісу.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;