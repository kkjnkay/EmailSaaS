import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../styles/App.css';

const LeadsTable = ({ campaignId }) => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'leads'),
      where('ownerUid', '==', auth.currentUser?.uid),
      where('campaignId', '==', campaignId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeads(loaded);
    });

    return () => unsubscribe();
  }, [campaignId]);

  const toggleLeadActive = async (id, currentValue) => {
    try {
      await updateDoc(doc(db, 'leads', id), {
        active: !currentValue,
      });
    } catch (err) {
      console.error('❌ Failed to update lead status:', err);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentIds = filteredLeads.map((lead) => lead.id);
    if (selectedIds.length === currentIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm('Are you sure you want to delete selected leads?')) return;

    for (const id of selectedIds) {
      try {
        await deleteDoc(doc(db, 'leads', id));
      } catch (err) {
        console.error(`❌ Failed to delete lead ${id}:`, err);
      }
    }

    setSelectedIds([]);
  };

  const filteredLeads = leads.filter((lead) => {
    const term = search.toLowerCase();
    return (
      lead.firstName?.toLowerCase().includes(term) ||
      lead.lastName?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="leads-table">
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '250px',
          }}
        />
        {selectedIds.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🗑️ Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {filteredLeads.length === 0 ? (
        <p style={{ paddingTop: '20px' }}>No leads found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedIds.length > 0 &&
                    selectedIds.length === filteredLeads.length
                  }
                />
              </th>
              <th>Active</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Job Title</th>
              <th>Location</th>
              <th>LinkedIn</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(lead.id)}
                    onChange={() => handleSelect(lead.id)}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={lead.active !== false}
                    onChange={() =>
                      toggleLeadActive(lead.id, lead.active !== false)
                    }
                  />
                </td>
                <td>{lead.firstName}</td>
                <td>{lead.lastName}</td>
                <td>{lead.jobTitle}</td>
                <td>{lead.location}</td>
                <td>
                  {lead.linkedin && (
                    <a
                      href={lead.linkedin}
                      target="_blank"
                      rel="noreferrer"
                    >
                      🔗
                    </a>
                  )}
                </td>
                <td>{lead.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeadsTable;
