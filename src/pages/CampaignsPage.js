import React from 'react';
import Sidebar from '../components/Sidebar';
import CampaignList from '../components/CampaignList';

const CampaignsPage = () => {
  return (
    <div className="main-container">
      <Sidebar />
      <CampaignList />
    </div>
  );
};

export default CampaignsPage;
