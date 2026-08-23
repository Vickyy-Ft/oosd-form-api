import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Load initial state from sessionStorage for refresh persistence
  const [language, setLanguage] = useState(() => sessionStorage.getItem('app_language') || null);
  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem('app_formData');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentFieldIndex, setCurrentFieldIndex] = useState(() => {
    const saved = sessionStorage.getItem('app_fieldIndex');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [stage, setStage] = useState(() => sessionStorage.getItem('app_stage') || 'language');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Sync state changes to sessionStorage
  useEffect(() => {
    if (language) sessionStorage.setItem('app_language', language);
    else sessionStorage.removeItem('app_language');
  }, [language]);

  useEffect(() => {
    if (formData) sessionStorage.setItem('app_formData', JSON.stringify(formData));
    else sessionStorage.removeItem('app_formData');
  }, [formData]);

  useEffect(() => {
    sessionStorage.setItem('app_fieldIndex', currentFieldIndex.toString());
  }, [currentFieldIndex]);

  useEffect(() => {
    sessionStorage.setItem('app_stage', stage);
  }, [stage]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const resetApp = () => {
    setLanguage(null);
    setFormData(null);
    setCurrentFieldIndex(0);
    setStage('language');
    sessionStorage.clear();
  };

  const value = {
    sessionId,
    language,
    setLanguage,
    formData,
    setFormData,
    currentFieldIndex,
    setCurrentFieldIndex,
    stage,
    setStage,
    isOnline,
    resetApp
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
