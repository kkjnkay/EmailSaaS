import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../styles/App.css';

const CampaignSequences = ({ campaignId }) => {
  const [steps, setSteps] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(null);

  useEffect(() => {
    const loadSequences = async () => {
      const ref = doc(db, 'campaigns', campaignId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSteps(snap.data().sequences || []);
      }
    };
    loadSequences();
  }, [campaignId]);

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, { subject: '', body: '', delayInDays: 1 }]);
    setActiveStepIndex(steps.length);
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
    setActiveStepIndex(null);
  };

  const save = async () => {
    const ref = doc(db, 'campaigns', campaignId);
    await updateDoc(ref, {
      sequences: steps
    });
    alert('Sequences saved to campaign!');
  };

  return (
    <div className="sequence-layout" style={{ display: 'flex', gap: '20px' }}>
      <div className="sequence-steps-column" style={{ width: '300px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button onClick={addStep} className="add-step-btn">+ Add step</button>
          <button onClick={save} className="save-btn">💾 Save</button>
        </div>
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step-card ${index === activeStepIndex ? 'active' : ''}`}
            style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '10px',
              marginBottom: '10px',
              background: '#f9f9f9',
              cursor: 'pointer'
            }}
            onClick={() => setActiveStepIndex(index)}
          >
            <div><strong>Step {index + 1}</strong></div>
            <div>{step.subject || '<No subject>'}</div>
            {index < steps.length - 1 && (
              <div>
                Delay:
                <input
                  type="number"
                  min="1"
                  value={step.delayInDays}
                  onChange={(e) => updateStep(index, 'delayInDays', Number(e.target.value))}
                  style={{ width: '60px', marginLeft: '5px' }}
                />
                days
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sequence-editor" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {activeStepIndex !== null && steps[activeStepIndex] && (
          <div className="editor-panel" style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '30px',
            background: '#fff',
            width: '80%',
            maxWidth: '700px'
          }}>
            <h3>Step {activeStepIndex + 1} Settings</h3>
            <input
              placeholder="Subject"
              value={steps[activeStepIndex].subject}
              onChange={(e) => updateStep(activeStepIndex, 'subject', e.target.value)}
              className="sequence-input"
              style={{ width: '96%', padding: '10px', marginBottom: '15px', fontSize: '16px' }}
            />
            <textarea
              placeholder="Email body..."
              value={steps[activeStepIndex].body}
              onChange={(e) => updateStep(activeStepIndex, 'body', e.target.value)}
              className="sequence-textarea"
              style={{ width: '95%', height: '350px', padding: '14px', fontSize: '16px' }}
            />
            <button onClick={() => removeStep(activeStepIndex)} className="delete-step-btn" style={{ marginTop: '20px' }}>🗑 Delete this step</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignSequences;
