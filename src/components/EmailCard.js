import React from 'react';
import '../styles/App.css';

const EmailCard = ({ name, sent, limit, onSettings }) => {
  return (
    <div className="campaign-card">
      <div className="campaign-main">
        <div className="campaign-name">{name}</div>
        <button className="settings-button" onClick={onSettings}>⚙️</button>
      </div>
      <div className="campaign-stats">
        <div><strong>Sent:</strong> {sent} of {limit}</div>
      </div>
    </div>
  );
};

export default EmailCard;
