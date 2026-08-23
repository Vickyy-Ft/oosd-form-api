import { useState, useCallback, useRef } from 'react';
import { textToSpeech } from '../utils/api';

const LANG_CODE = {
  tamil: 'ta-IN',
  hindi: 'hi-IN',
  english: 'en-IN'
};

const RATE = {
  tamil: 0.9,
  hindi: 0.9,
  english: 1.0
};

export const useSpeechSynthesis = (language) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);

  const fallbackBrowserSpeak = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      setIsPlaying(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const langCode = LANG_CODE[language] || 'en-IN';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = RATE[language] || 1.0;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang === langCode) || voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted') setError('Browser TTS failed');
        setIsPlaying(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Browser TTS fallback error:', e);
      setIsPlaying(false);
    }
  }, [language]);

  const speak = useCallback(async (text) => {
    if (!text) return;

    try {
      setError(null);
      setIsPlaying(true);

      // Stop any existing audio or speech
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // 1. Try Sarvam AI TTS API
      const response = await textToSpeech(text, language);

      if (response.audioContent && !response.browserTTS) {
        // Play Sarvam AI base64 audio
        const audioBlob = base64ToBlob(response.audioContent, 'audio/wav');
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = (e) => {
          console.warn('Audio playback error, falling back to browser TTS:', e);
          URL.revokeObjectURL(audioUrl);
          fallbackBrowserSpeak(text);
        };

        await audio.play();
      } else {
        // Fall back to browser Web Speech API
        fallbackBrowserSpeak(text);
      }

    } catch (err) {
      console.warn('API TTS failed, falling back to browser speech:', err.message);
      fallbackBrowserSpeak(text);
    }
  }, [language, fallbackBrowserSpeak]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  return { speak, stop, isPlaying, error };
};

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}
