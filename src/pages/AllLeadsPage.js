import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Sidebar from '../components/Sidebar';
import '../styles/App.css';

const AllLeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState({});
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubLeads = onSnapshot(
      query(collection(db, 'leads'), where('ownerUid', '==', auth.currentUser?.uid)),
      (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeads(loaded);
      }
    );

    const loadCampaigns = async () => {
      const snap = await getDocs(query(collection(db, 'campaigns'), where('ownerUid', '==', auth.currentUser?.uid)));
      const result = {};
      snap.forEach(doc => {
        result[doc.id] = doc.data().name;
      });
      setCampaigns(result);
    };

    loadCampaigns();
    return () => unsubLeads();
  }, []);

  const handleSelect = (leadId) => {
    setSelected(prev => prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]);
  };

  const handleDeleteSelected = async () => {
    const confirm = window.confirm(`Delete ${selected.length} lead(s)?`);
    if (!confirm) return;

    for (const id of selected) {
      await deleteDoc(doc(db, 'leads', id));
    }
    setSelected([]);
  };

  const filteredLeads = leads.filter((lead) => {
    const term = search.toLowerCase();
    return (
      lead.firstName?.toLowerCase().includes(term) ||
      lead.lastName?.toLowerCase().includes(term) ||
      lead.jobTitle?.toLowerCase().includes(term) ||
      lead.location?.toLowerCase().includes(term) ||
      lead.linkedin?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content-container">
        <h2>All Leads</h2>

        <div className="leads-header">
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {selected.length > 0 && (
            <button onClick={handleDeleteSelected} className="delete-button">
              🗑 Delete Selected
            </button>
          )}
        </div>

        {filteredLeads.length > 0 ? (
          <div className="leads-table">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>LinkedIn</th>
                  <th>Email</th>
                  <th>Campaign</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(lead.id)}
                        onChange={() => handleSelect(lead.id)}
                      />
                    </td>
                    <td>{lead.firstName}</td>
                    <td>{lead.lastName}</td>
                    <td>{lead.jobTitle}</td>
                    <td>{lead.location}</td>
                    <td>
                      <a href={lead.linkedin} target="_blank" rel="noreferrer">🔗</a>
                    </td>
                    <td>{lead.email}</td>
                    <td>{campaigns[lead.campaignId] || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No leads found.</p>
        )}
      </div>
    </div>
  );
};

export default AllLeadsPage;
