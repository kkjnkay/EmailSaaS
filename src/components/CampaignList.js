import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getCountFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import CampaignCard from './CampaignCard';
import Modal from './Modal';
import AddCampaignForm from './AddCampaignForm';
import '../styles/App.css';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadCounts, setLeadCounts] = useState({});
  const [replyCounts, setReplyCounts] = useState({});

  useEffect(() => {
    const q = query(
      collection(db, 'campaigns'),
      where('ownerUid', '==', auth.currentUser?.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCampaigns(fetched);

      const counts = {};
      const replies = {};

      for (const campaign of fetched) {
        // Підрахунок лідів
        const leadsQuery = query(
          collection(db, 'leads'),
          where('campaignId', '==', campaign.id)
        );
        const leadSnap = await getCountFromServer(leadsQuery);
        counts[campaign.id] = leadSnap.data().count;

        // Підрахунок відповідей
        const repliesQuery = query(
          collection(db, 'replies'),
          where('campaignId', '==', campaign.id)
        );
        const replySnap = await getCountFromServer(repliesQuery);
        replies[campaign.id] = replySnap.data().count;
      }

      setLeadCounts(counts);
      setReplyCounts(replies);
    });

    return () => unsubscribe();
  }, []);

  const handleAddSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="campaign-list">
      <div className="campaigns-header">
        <h2>Campaigns</h2>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>+ Add New</button>
      </div>

      {campaigns.length === 0 && <p>No campaigns yet. Click "+ Add New" to create one.</p>}

      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          id={campaign.id}
          name={campaign.name}
          leads={leadCounts[campaign.id] || 0}
          sent={campaign.sent || 0}
          replies={replyCounts[campaign.id] || 0}
          status={campaign.status || 'draft'}
        />
      ))}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AddCampaignForm onSuccess={handleAddSuccess} />
      </Modal>
    </div>
  );
};

export default CampaignList;
