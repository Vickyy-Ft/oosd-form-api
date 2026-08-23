import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import './PrivacyNotice.css';

const CONTENT = {
  english: {
    title: 'Privacy & Security First',
    internetRequired: 'This app requires an active internet connection.',
    points: [
      'Your photos are analyzed by AI and deleted immediately.',
      'Voice recordings are transcribed and never stored.',
      'We do not collect, share, or sell your personal data.',
      'Your session is wiped completely when you close the app.'
    ],
    accept: 'I Understand & Agree',
    decline: 'Decline (Exit)'
  },
  tamil: {
    title: 'தனியுரிமை மற்றும் பாதுகாப்பு',
    internetRequired: 'இந்தப் பயன்பாட்டிற்கு இணைய இணைப்பு தேவை.',
    points: [
      'உங்கள் புகைப்படங்கள் AI ஆல் பகுப்பாய்வு செய்யப்பட்டு உடனடியாக நீக்கப்படும்.',
      'குரல் பதிவுகள் படியெடுக்கப்பட்டு ஒருபோதும் சேமிக்கப்படாது.',
      'உங்கள் தனிப்பட்ட தரவை நாங்கள் சேகரிக்கவோ பகிரவோ மாட்டோம்.',
      'பயன்பாட்டை மூடும்போது உங்கள் தரவு முற்றிலுமாக அழிக்கப்படும்.'
    ],
    accept: 'நான் புரிந்துகொண்டு ஏற்கிறேன்',
    decline: 'நிராகரி (வெளியேறு)'
  },
  hindi: {
    title: 'गोपनीयता और सुरक्षा',
    internetRequired: 'इस ऐप के लिए इंटरनेट कनेक्शन की आवश्यकता है।',
    points: [
      'आपकी तस्वीरों का AI द्वारा विश्लेषण किया जाता है और तुरंत हटा दिया जाता है।',
      'वॉयस रिकॉर्डिंग को ट्रांसक्राइब किया जाता है और कभी स्टोर नहीं किया जाता।',
      'हम आपका व्यक्तिगत डेटा एकत्र या साझा नहीं करते हैं।',
      'ऐप बंद करने पर आपका सत्र पूरी तरह से मिटा दिया जाता है।'
    ],
    accept: 'मैं समझता हूँ और सहमत हूँ',
    decline: 'अस्वीकार करें (बाहर निकलें)'
  }
};

const PrivacyNotice = () => {
  const { language, setStage, resetApp } = useAppContext();
  const content = CONTENT[language] || CONTENT.english;

  return (
    <div className="privacy-notice">
      <div className="glass-panel">
        <h2 className="heading-primary">{content.title}</h2>
        
        <div className="internet-notice">
          <span className="wifi-icon">📶</span>
          <p>{content.internetRequired}</p>
        </div>

        <ul className="privacy-points">
          {content.points.map((point, index) => (
            <li key={index} className="privacy-point">
              <span className="check-icon">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="privacy-actions">
          <button className="btn-decline" onClick={resetApp}>
            {content.decline}
          </button>
          <button className="btn-accept" onClick={() => setStage('capture')}>
            {content.accept}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;
