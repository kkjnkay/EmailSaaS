import React from 'react';
import Sidebar from '../components/Sidebar';
import EmailList from '../components/EmailList';

const EmailsPage = () => {
  return (
    <div className="main-container">
      <Sidebar />
      <EmailList />
    </div>
  );
};

export default EmailsPage;