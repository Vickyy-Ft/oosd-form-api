import React, { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { simplifyAndTranslate } from '../utils/api';
import './ProcessingStage.css';

const CONTENT = {
  english: {
    title: 'Processing Your Form',
    message: 'Making the instructions simple and clear...'
  },
  tamil: {
    title: 'உங்கள் படிவத்தை செயலாக்குகிறது',
    message: 'வழிமுறைகளை எளிமையாகவும் தெளிவாகவும் மாற்றுகிறது...'
  },
  hindi: {
    title: 'आपका फॉर्म प्रोसेस किया जा रहा है',
    message: 'निर्देशों को सरल और स्पष्ट बनाया जा रहा है...'
  }
};

const ProcessingStage = () => {
  const { language, formData, setFormData, setStage } = useAppContext();
  const content = CONTENT[language] || CONTENT.english;

  useEffect(() => {
    const processForm = async () => {
      try {
        const response = await simplifyAndTranslate(formData, language);
        
        if (response.success && response.formData) {
          setFormData(response.formData);
          setStage('voice');
        } else {
          // Fallback: use original text if simplification fails
          console.warn('Simplification failed, using original text');
          setStage('voice');
        }
      } catch (error) {
        console.error('Processing error:', error);
        // Continue with original text on error
        setStage('voice');
      }
    };

    if (formData) {
      processForm();
    }
  }, [formData, language, setFormData, setStage]);

  return (
    <div className="processing-stage">
      <div className="glass-panel text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '4rem 2rem' }}>
        <div className="spinner-glow"></div>
        <div>
          <h2 className="heading-primary">{content.title}</h2>
          <p className="text-muted">{content.message}</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStage;
