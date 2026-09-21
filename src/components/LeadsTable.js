import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';


const LeadsTable = ({ campaignId }) => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'leads'),
      where('ownerUid', '==', auth.currentUser?.uid),
      where('campaignId', '==', campaignId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLeads(loaded);
    });

    return () => unsubscribe();
  }, [campaignId]);

  // Функція для збереження абревіатури при втраті фокусу (onBlur)
  const handleAbbrevChange = async (id, value) => {
    try {
      await updateDoc(doc(db, 'leads', id), { abbreviation: value.trim() });
    } catch (err) {
      console.error('Помилка оновлення скорочення:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Видалити ліда?')) {
      await deleteDoc(doc(db, 'leads', id));
    }
  };

  const filteredLeads = leads.filter(lead => lead.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="leads-table">
      <input
        type="text"
        placeholder="Пошук за email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <table>
        <thead>
          <tr>
            <th>Скорочення (Код)</th>
            <th>Ім'я</th>
            <th>Email</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <input
                  type="text"
                  defaultValue={lead.abbreviation || ''}
                  onBlur={(e) => handleAbbrevChange(lead.id, e.target.value)}
                  placeholder="напр. ВЕР"
                  style={{ padding: '6px', width: '80px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </td>
              <td>{lead.firstName} {lead.lastName}</td>
              <td>{lead.email}</td>
              <td>
                <button onClick={() => handleDelete(lead.id)} className="delete-button">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;