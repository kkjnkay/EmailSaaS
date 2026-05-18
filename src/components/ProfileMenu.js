import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/App.css';

const ProfileMenu = ({ onLogout }) => {
  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  return (
    <div className="profile-menu">
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default ProfileMenu;
