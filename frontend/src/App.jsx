import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import LanguageSelector from './components/LanguageSelector';
import PrivacyNotice from './components/PrivacyNotice';
import CaptureStage from './components/CaptureStage';
import ProcessingStage from './components/ProcessingStage';
import VoiceStage from './components/VoiceStage';
import OutputStage from './components/OutputStage';
import NetworkStatus from './components/NetworkStatus';
import './App.css';

const AppContent = () => {
  const { stage } = useAppContext();

  return (
    <>
      <NetworkStatus />
      
      <main className="app-main">
        {stage === 'language' && <LanguageSelector />}
        {stage === 'privacy' && <PrivacyNotice />}
        {stage === 'capture' && <CaptureStage />}
        {stage === 'extracting' && <ProcessingStage />}
        {stage === 'simplifying' && <ProcessingStage />}
        {stage === 'voice' && <VoiceStage />}
        {stage === 'output' && <OutputStage />}
      </main>
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
