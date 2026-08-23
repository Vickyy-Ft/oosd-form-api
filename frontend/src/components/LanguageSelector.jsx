import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { setLanguage, setStage } = useAppContext();

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setStage('privacy');
  };

  return (
    <div className="language-selector">
      <div className="glass-panel">
        
        {/* Sleek App Branding */}
        <div className="brand-header">
          <div className="brand-icon">✨</div>
          <h1 className="brand-title">FormAssistant</h1>
        </div>
        
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Choose your language<br/>
          மொழியைத் தேர்ந்தெடுக்கவும்<br/>
          अपनी भाषा चुनें
        </p>
        
        <div className="language-grid">
          <button
            className="lang-card"
            onClick={() => handleLanguageSelect('english')}
            aria-label="Select English language"
          >
            <span className="lang-icon" style={{ fontFamily: 'var(--font-display)', opacity: 0.8 }}>Aa</span>
            <span className="lang-name">English</span>
            <span className="lang-sub">English</span>
          </button>

          <button
            className="lang-card"
            onClick={() => handleLanguageSelect('tamil')}
            aria-label="Select Tamil language"
          >
            <span className="lang-icon" style={{ opacity: 0.8 }}>அ</span>
            <span className="lang-name">தமிழ்</span>
            <span className="lang-sub">Tamil</span>
          </button>

          <button
            className="lang-card"
            onClick={() => handleLanguageSelect('hindi')}
            aria-label="Select Hindi language"
          >
            <span className="lang-icon" style={{ opacity: 0.8 }}>अ</span>
            <span className="lang-name">हिंदी</span>
            <span className="lang-sub">Hindi</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default LanguageSelector;
