import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

const LeadsUploader = ({ campaignId }) => {
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [loading, setLoading] = useState(false);

  // Стани для модалки глобальної бази
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [globalLeads, setGlobalLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  // Блокування скролу
  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    let existingEmails = new Set();
    if (!allowDuplicates) {
      const q = query(collection(db, 'leads'), where('ownerUid', '==', auth.currentUser?.uid));
      const snapshot = await getDocs(q);
      existingEmails = new Set(snapshot.docs.map(doc => doc.data().email.toLowerCase()));
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: async (results) => {
        const rows = results.data.filter(row => row["Work Email"] || row["Email"]);
        const leadsToAdd = [];

        for (const lead of rows) {
          const email = (lead["Work Email"] || lead["Email"] || '').toLowerCase();
          
          if (!allowDuplicates && existingEmails.has(email)) continue;

          leadsToAdd.push({
            firstName: lead["First Name"] || '',
            lastName: lead["Last Name"] || '',
            email,
            abbreviation: lead["Abbreviation"] || lead["Скорочення"] || '', 
            ownerUid: auth.currentUser?.uid,
            campaignId,
            active: true,
            createdAt: serverTimestamp(),
          });
        }

        for (const lead of leadsToAdd) {
          try {
            await addDoc(collection(db, 'leads'), lead);
          } catch (err) {
            console.error("❌ Error saving lead:", err);
          }
        }

        alert(`✅ Завантажено ${leadsToAdd.length} лідів з файлу.`);
        setLoading(false);
        e.target.value = null; 
      },
      error: (error) => {
        console.error("CSV parsing failed:", error);
        alert("⛔ Помилка при обробці CSV.");
        setLoading(false);
      }
    });
  };

  // 🔥 ВІДКРИТТЯ МОДАЛКИ ТА ЗАВАНТАЖЕННЯ ГЛОБАЛЬНОЇ БАЗИ
  const openGlobalModal = async () => {
    setIsClosing(false);
    setShowModal(true);
    setIsLoadingGlobal(true);
    setSelectedLeads(new Set());
    setSearchTerm('');

    try {
      // 1. Отримуємо тих, хто ВЖЕ Є у цій кампанії (щоб не додати їх двічі)
      const qCurrent = query(collection(db, 'leads'), where('campaignId', '==', campaignId));
      const snapCurrent = await getDocs(qCurrent);
      const currentEmails = new Set(snapCurrent.docs.map(d => d.data().email.toLowerCase()));

      // 2. Отримуємо ВСІХ лідів користувача
      const qAll = query(collection(db, 'leads'), where('ownerUid', '==', auth.currentUser?.uid));
      const snapAll = await getDocs(qAll);
      
      const uniqueLeads = [];
      const seenEmails = new Set();

      snapAll.docs.forEach(doc => {
        const lead = doc.data();
        const email = lead.email?.toLowerCase();
        
        // Відфільтровуємо тих, хто вже в цій кампанії, і прибираємо глобальні дублі
        if (email && !currentEmails.has(email) && !seenEmails.has(email)) {
          seenEmails.add(email);
          uniqueLeads.push({ id: doc.id, ...lead });
        }
      });

      setGlobalLeads(uniqueLeads);
    } catch (err) {
      console.error("Помилка завантаження глобальної бази:", err);
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const closeGlobalModal = () => {
    setIsClosing(true);
    setTimeout(() => setShowModal(false), 250);
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) newSet.delete(leadId);
      else newSet.add(leadId);
      return newSet;
    });
  };

  const handleAddSelectedLeads = async () => {
    if (selectedLeads.size === 0) return;
    
    setLoading(true);
    closeGlobalModal();

    const leadsToAdd = globalLeads.filter(lead => selectedLeads.has(lead.id));
    let addedCount = 0;

    for (const lead of leadsToAdd) {
      try {
        await addDoc(collection(db, 'leads'), {
          firstName: lead.firstName || '',
          lastName: lead.lastName || '',
          email: lead.email,
          abbreviation: lead.abbreviation || '',
          ownerUid: auth.currentUser?.uid,
          campaignId, // 🔥 Прив'язуємо до поточної кампанії
          active: true,
          createdAt: serverTimestamp(),
        });
        addedCount++;
      } catch (err) {
        console.error("Помилка додавання ліда:", err);
      }
    }

    alert(`✅ Успішно додано ${addedCount} викладачів із загальної бази.`);
    setLoading(false);
  };

  // Фільтрація для пошуку
  const filteredLeads = globalLeads.filter(lead => 
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ marginBottom: '40px' }}>
      
      <label className="checkbox-wrapper">
        <input 
          type="checkbox" 
          checked={allowDuplicates} 
          onChange={(e) => setAllowDuplicates(e.target.checked)} 
          disabled={loading}
        />
        Дозволити дублікати адрес (режим тестування)
      </label>

      {/* Зона завантаження з файлу */}
      <div className="upload-zone" style={{ marginBottom: '20px' }}>
        <span className="upload-icon">📁</span>
        <div className="upload-text">Натисніть або перетягніть CSV-файл сюди</div>
        <div className="upload-subtext">Очікувані колонки: First Name, Last Name, Email, Скорочення</div>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFile} 
          disabled={loading} 
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>АБО</span>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
      </div>

      {/* Кнопка відкриття глобальної бази */}
      <button 
        onClick={openGlobalModal}
        disabled={loading}
        style={{
          width: '100%', padding: '14px', background: '#f8fafc', color: 'var(--primary)',
          border: '2px dashed #cbd5e1', borderRadius: 'var(--radius-lg)',
          fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#eff6ff'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
      >
        <span style={{ fontSize: '20px' }}>👥</span> Вибрати викладачів із глобальної бази
      </button>
      
      {loading && (
        <div className="loading-state">
          <span>⏳</span> Обробка та збереження викладачів в базу...
        </div>
      )}

      {/* 🔥 МОДАЛКА ГЛОБАЛЬНОЇ БАЗИ */}
      {showModal && (
        <>
          <style>
            {`
              @keyframes modalEnter { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
              @keyframes modalExit { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.95) translateY(10px); } }
              @keyframes backdropEnter { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(4px); } }
              @keyframes backdropExit { from { opacity: 1; backdrop-filter: blur(4px); } to { opacity: 0; backdrop-filter: blur(0px); } }
              
              /* Кастомний скрол для таблиці */
              .custom-scroll::-webkit-scrollbar { width: 6px; }
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
              .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}
          </style>
          
          <div 
            onClick={closeGlobalModal} 
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.5)', zIndex: 99999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: `${isClosing ? 'backdropExit' : 'backdropEnter'} 0.25s ease-out forwards`
            }}
          >
            <div 
              onClick={e => e.stopPropagation()} 
              style={{
                width: '100%', maxWidth: '700px', background: '#ffffff',
                borderRadius: '24px', padding: '32px', position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: `${isClosing ? 'modalExit' : 'modalEnter'} 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                display: 'flex', flexDirection: 'column', maxHeight: '85vh'
              }}
            >
              <button 
                onClick={closeGlobalModal}
                style={{
                  position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none',
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
              >✕</button>

              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>Глобальна база викладачів</h3>
              
              <input
                type="text"
                placeholder="Пошук за іменем, email або скороченням..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1',
                  fontSize: '14px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
              />

              <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                {isLoadingGlobal ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Завантаження бази...</div>
                ) : filteredLeads.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    {searchTerm ? 'Нікого не знайдено за вашим запитом.' : 'Нових викладачів у базі не знайдено.'}
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'center', width: '40px', borderBottom: '1px solid #e2e8f0' }}>
                          <input 
                            type="checkbox" 
                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                            checked={filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
                              else setSelectedLeads(new Set());
                            }}
                          />
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Скорочення</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>ПІБ</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map(lead => (
                        <tr 
                          key={lead.id} 
                          onClick={() => toggleLeadSelection(lead.id)}
                          style={{ 
                            background: selectedLeads.has(lead.id) ? '#eff6ff' : '#ffffff', 
                            borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' 
                          }}
                          onMouseOver={e => !selectedLeads.has(lead.id) && (e.currentTarget.style.background = '#f8fafc')}
                          onMouseOut={e => !selectedLeads.has(lead.id) && (e.currentTarget.style.background = '#ffffff')}
                        >
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedLeads.has(lead.id)} 
                              readOnly
                              style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{lead.abbreviation || '—'}</td>
                          <td style={{ padding: '12px' }}>{lead.firstName} {lead.lastName}</td>
                          <td style={{ padding: '12px', color: '#475569' }}>{lead.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                  Обрано: <strong style={{ color: 'var(--primary)' }}>{selectedLeads.size}</strong> з {filteredLeads.length}
                </span>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={closeGlobalModal}
                    style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Скасувати
                  </button>
                  <button 
                    onClick={handleAddSelectedLeads}
                    disabled={selectedLeads.size === 0}
                    style={{ 
                      padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none', 
                      borderRadius: '8px', fontWeight: '600', cursor: selectedLeads.size === 0 ? 'not-allowed' : 'pointer',
                      opacity: selectedLeads.size === 0 ? 0.5 : 1, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                    }}
                  >
                    Додати в кампанію
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default LeadsUploader;