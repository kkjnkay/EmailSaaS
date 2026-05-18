import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/App.css';

const LandingPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (type) => {
    try {
      if (type === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="landing-page">
      <h1>EmailSaaS</h1>
      <p>Manage your outreach campaigns.</p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="input"
      />

      <div className="landing-buttons">
        <button className="login-btn" onClick={() => handleAuth('login')}>Login</button>
        <button className="register-btn" onClick={() => handleAuth('register')}>Register</button>
      </div>

      <div className="google-section">
        <p>or</p>
        <button className="google-btn" onClick={handleGoogleLogin}>
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="google-icon"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
