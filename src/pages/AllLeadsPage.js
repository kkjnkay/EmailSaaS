import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Sidebar from '../components/Sidebar';

const AllLeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState([]); // Тепер тут зберігаємо email-и замість id
  const [search, setSearch] = useState('');

  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', abbreviation: '' });
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const unsubLeads = onSnapshot(
      query(collection(db, 'leads'), where('ownerUid', '==', auth.currentUser?.uid)),
      (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 🔥 ГРУПУВАННЯ ДУБЛІКАТІВ ЗА EMAIL
        const uniqueLeadsMap = new Map();
        
        loaded.forEach(lead => {
          const emailKey = lead.email?.toLowerCase().trim();
          if (!emailKey) return; // Ігноруємо пусті записи
          
          if (!uniqueLeadsMap.has(emailKey)) {
            // Зберігаємо першого знайденого викладача і створюємо масив для всіх його ID
            uniqueLeadsMap.set(emailKey, { ...lead, allIds: [lead.id] });
          } else {
            // Якщо такий email вже є, просто додаємо його ID до списку
            uniqueLeadsMap.get(emailKey).allIds.push(lead.id);
          }
        });

        setLeads(Array.from(uniqueLeadsMap.values()));
      }
    );
    return () => unsubLeads();
  }, []);

  const handleSelect = (email) => {
    setSelected(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  };

  const handleDeleteSelected = async () => {
    const confirm = window.confirm(`Ви впевнені, що хочете видалити ${selected.length} викладачів з УСІХ кампаній?`);
    if (!confirm) return;

    for (const email of selected) {
      const leadGroup = leads.find(l => l.email === email);
      if (leadGroup) {
        // Видаляємо всі копії цього викладача по всіх кампаніях
        for (const id of leadGroup.allIds) {
          await deleteDoc(doc(db, 'leads', id));
        }
      }
    }
    setSelected([]);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setForm({
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      email: lead.email || '',
      abbreviation: lead.abbreviation || ''
    });
    setIsClosing(false);
    document.body.style.overflow = 'hidden';
  };

  const closeEditModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setEditingLead(null);
      document.body.style.overflow = 'unset';
    }, 250);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveLead = async () => {
    try {
      // Оновлюємо дані у ВСІХ копіях цього викладача (в усіх кампаніях)
      for (const id of editingLead.allIds) {
        await updateDoc(doc(db, 'leads', id), form);
      }
      closeEditModal();
    } catch (err) {
      console.error('Помилка оновлення викладача:', err);
      alert('Не вдалося зберегти зміни.');
    }
  };

  const handleDeleteSingleLead = async () => {
    const confirm = window.confirm(`Видалити викладача ${form.firstName} ${form.lastName} з УСІХ кампаній у системі?`);
    if (!confirm) return;

    try {
      // Видаляємо всі копії цього викладача
      for (const id of editingLead.allIds) {
        await deleteDoc(doc(db, 'leads', id));
      }
      closeEditModal();
    } catch (err) {
      console.error('Помилка видалення викладача:', err);
      alert('Не вдалося видалити запис.');
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const term = search.toLowerCase();
    return (
      lead.firstName?.toLowerCase().includes(term) ||
      lead.lastName?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.abbreviation?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="main-container">
      <Sidebar />
      
      <style>
        {`
          @keyframes modalEnter { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          @keyframes modalExit { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.9) translateY(20px); } }
          @keyframes backdropEnter { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(8px); } }
          @keyframes backdropExit { from { opacity: 1; backdrop-filter: blur(8px); } to { opacity: 0; backdrop-filter: blur(0px); } }
          .premium-input {
            width: 100%; padding: 12px 16px; background: #f8fafc; border: 2px solid transparent;
            border-radius: 12px; font-size: 14px; color: var(--text-main); transition: all 0.2s ease; box-sizing: border-box;
          }
          .premium-input:focus {
            background: #ffffff; border-color: var(--primary); boxShadow: 0 4px 12px rgba(79, 70, 229, 0.15); outline: none;
          }
          .table-row { border-bottom: 1px solid #f1f5f9; transition: all 0.2s ease; }
          .table-row:hover { background-color: #f8fafc; }
          .table-row.selected { background-color: #eff6ff; }
          .table-row.selected:hover { background-color: #dbeafe; }
          .table-row.selected td:first-child { box-shadow: inset 4px 0 0 0 var(--primary); }
        `}
      </style>

      <div className="content-container" style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2>Глобальний довідник викладачів</h2>

          <div className="leads-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '30px' }}>
            <input
              type="text"
              placeholder="Пошук за іменем, поштою або скороченням..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }}
            />
            {selected.length > 0 && (
              <button onClick={handleDeleteSelected} className="delete-button" style={{ padding: '12px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition)', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)' }}>
                🗑 Видалити обрані ({selected.length})
              </button>
            )}
          </div>

          {filteredLeads.length > 0 ? (
            <div className="leads-table">
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px', width: '40px', textAlign: 'center' }}></th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Скорочення</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Ім'я</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Прізвище</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => {
                    const isSelected = selected.includes(lead.email); // Перевіряємо по email
                    return (
                      <tr key={lead.email} className={`table-row ${isSelected ? 'selected' : ''}`}>
                        <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'middle' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelect(lead.email)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '16px', fontWeight: '700', color: '#0f172a', verticalAlign: 'middle' }}>
                          <span style={{ background: isSelected ? '#dbeafe' : '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', transition: 'var(--transition)' }}>
                            {lead.abbreviation || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', verticalAlign: 'middle', color: isSelected ? '#1e40af' : 'inherit' }}>{lead.firstName}</td>
                        <td style={{ padding: '16px', verticalAlign: 'middle', color: isSelected ? '#1e40af' : 'inherit' }}>{lead.lastName}</td>
                        <td style={{ padding: '16px', verticalAlign: 'middle', color: isSelected ? '#3b82f6' : '#475569' }}>{lead.email}</td>
                        <td style={{ padding: '16px', textAlign: 'right', verticalAlign: 'middle' }}>
                          <button
                            onClick={() => openEditModal(lead)}
                            title="Редагувати дані викладача"
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '32px', height: '32px', background: isSelected ? '#bfdbfe' : '#f1f5f9', color: isSelected ? '#1d4ed8' : '#475569',
                              border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'var(--transition)'
                            }}
                            onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseOut={e => { e.currentTarget.style.backgroundColor = isSelected ? '#bfdbfe' : '#f1f5f9'; e.currentTarget.style.color = isSelected ? '#1d4ed8' : '#475569'; }}
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#64748b', marginTop: '20px' }}>Викладачів не знайдено.</p>
          )}
        </div>
      </div>

      {/* Модальне вікно редагування */}
      {editingLead && (
        <div 
          onClick={closeEditModal} 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, animation: `${isClosing ? 'backdropExit' : 'backdropEnter'} 0.25s ease-out forwards`
          }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{
              width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '24px', padding: '40px 32px 32px',
              position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(79, 70, 229, 0.1)',
              animation: `${isClosing ? 'modalExit' : 'modalEnter'} 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards`
            }}
          >
            <div style={{
              position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', width: '64px', height: '64px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #3730a3 100%)', borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)', rotate: '3deg'
            }}>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            
            <button 
              onClick={closeEditModal}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', 
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '28px', marginTop: '10px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--bg-sidebar)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
                Картка викладача
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                  Скорочення (Код)
                </label>
                <input name="abbreviation" type="text" value={form.abbreviation} onChange={handleFormChange} className="premium-input" placeholder="напр. ВЕР" style={{ fontWeight: '700', letterSpacing: '0.5px' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', color: 'var(--text-muted)', marginLeft: '4px' }}>Ім'я</label>
                  <input name="firstName" type="text" value={form.firstName} onChange={handleFormChange} className="premium-input" placeholder="Василь" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', color: 'var(--text-muted)', marginLeft: '4px' }}>Прізвище</label>
                  <input name="lastName" type="text" value={form.lastName} onChange={handleFormChange} className="premium-input" placeholder="Роїк" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', color: 'var(--text-muted)', marginLeft: '4px' }}>Email адреса</label>
                <input name="email" type="email" value={form.email} onChange={handleFormChange} className="premium-input" placeholder="v.roik@lpnu.ua" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={handleSaveLead} 
                style={{ 
                  width: '100%', padding: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #3730a3 100%)', 
                  color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                💾 Зберегти зміни скрізь
              </button>
              
              <button 
                onClick={handleDeleteSingleLead} 
                style={{ 
                  width: '100%', padding: '12px', background: 'transparent', color: '#ef4444', border: '2px solid transparent', 
                  borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                Видалити з усіх кампаній
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllLeadsPage;