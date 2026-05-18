import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from '../components/Sidebar';
import '../styles/App.css';
import LeadsUploader from '../components/LeadsUploader';
import LeadsTable from '../components/LeadsTable';
import CampaignSequences from '../components/CampaignSequences';
import CampaignOptions from '../components/CampaignOptions';

const tabs = ['Leads', 'Sequences', 'Options'];

const CampaignSettingsPage = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState('Leads');


  useEffect(() => {
    const fetchCampaign = async () => {
      const docRef = doc(db, 'campaigns', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setCampaign({ id: snap.id, ...snap.data() });
      }
    };
    fetchCampaign();
  }, [id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Leads':
        return (
            <>
                <LeadsUploader campaignId={campaign.id} />
                <LeadsTable campaignId={campaign.id} />
            </>
        );
      case 'Sequences':
        return <CampaignSequences campaignId={campaign.id} />;
      case 'Options':
        return <CampaignOptions campaignId={campaign.id} />;
      default:
        return null;
    }
  };

  if (!campaign) return <div>Loading...</div>;

  return (
    <div className="main-container">
      <Sidebar />
      <div className="campaign-settings">
        <h2>{campaign.name}</h2>
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CampaignSettingsPage;
