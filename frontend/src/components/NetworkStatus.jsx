import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import './NetworkStatus.css';

const CONTENT = {
  english: {
    offline: 'No Internet Connection',
    message: 'This app requires internet to work. Please check your connection.'
  },
  tamil: {
    offline: 'இணைய இணைப்பு இல்லை',
    message: 'இந்த பயன்பாட்டிற்கு இணையம் தேவை. உங்கள் இணைப்பை சரிபார்க்கவும்.'
  },
  hindi: {
    offline: 'कोई इंटरनेट कनेक्शन नहीं',
    message: 'इस ऐप को काम करने के लिए इंटरनेट की आवश्यकता है। कृपया अपना कनेक्शन जांचें।'
  }
};

const NetworkStatus = () => {
  const { isOnline, language } = useAppContext();
  const content = CONTENT[language] || CONTENT.english;

  if (isOnline) {
    return null;
  }

  return (
    <div className="network-status-overlay" role="alert" aria-live="assertive">
      <div className="network-status-modal">
        <div className="offline-icon" aria-hidden="true">📡</div>
        <h2 className="offline-title">{content.offline}</h2>
        <p className="offline-message">{content.message}</p>
        <div className="pulse-indicator">
          <div className="pulse-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;
