import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from '../components/Sidebar';
import LeadsUploader from '../components/LeadsUploader';
import LeadsTable from '../components/LeadsTable';
import CampaignOptions from '../components/CampaignOptions';
// 🔥 Імпортуємо наш новий компонент:
import SendHistory from '../components/SendHistory';

// 🔥 Додали третю вкладку:
const tabs = [
  { id: 'Leads', label: '👥 Викладачі' },
  { id: 'Send Data', label: '🚀 Відправка навантаження' },
  { id: 'History', label: '🕒 Історія розсилок' }
];

const CampaignSettingsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      case 'Send Data':
        return <CampaignOptions campaignId={campaign.id} />;
      case 'History':
        // 🔥 Рендеримо вкладку історії:
        return <SendHistory campaignId={campaign.id} />;
      default:
        return null;
    }
  };

  if (!campaign) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Завантаження налаштувань...
      </div>
    );
  }

  return (
    <div className="main-container">
      <Sidebar />
      <div className="campaign-settings">
        <div className="campaign-settings-inner">
          
          <button className="back-link" onClick={() => navigate('/campaigns')}>
            ← Назад до кампаній
          </button>
          
          <h2>{campaign.name}</h2>
          
          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'tab active' : 'tab'}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="tab-content">
            {renderContent()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CampaignSettingsPage;