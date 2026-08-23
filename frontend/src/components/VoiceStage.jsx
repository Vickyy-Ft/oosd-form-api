import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { speechToText, normalizeVoiceAnswer } from '../utils/api';
import './VoiceStage.css';

const CONTENT = {
  english: {
    field: 'Field',
    of: 'of',
    listen: 'Listen',
    record: 'Record Answer',
    stopRecording: 'Stop Recording',
    confirm: 'Confirm',
    correct: 'Re-record',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish Form',
    transcribing: 'Understanding & normalizing your answer with AI...',
    youSaid: 'You said:',
    normalizedAs: 'AI Structured Output:',
    isThisCorrect: 'Is this correct?',
    manualInput: 'Type answer manually',
    voiceInput: 'Switch to Voice Input',
    saveText: 'Save Answer',
    enterAnswer: 'Enter your answer here...',
    recordingTimeLeft: 'Recording... Auto-stop in',
    sec: 's',
    hints: {
      date: '💡 Tip: Say the day, month, and year (e.g. 15th August 1995)',
      number: '💡 Tip: Say numbers clearly (e.g. 50 thousand or 9 8 7 6 5)',
      choice: '💡 Tip: Say one of the options listed below',
      signature: '💡 Tip: Say your full legal name to acknowledge'
    }
  },
  tamil: {
    field: 'புலம்',
    of: 'இல்',
    listen: 'கேளுங்கள்',
    record: 'பதிலை பதிவுசெய்',
    stopRecording: 'பதிவை நிறுத்து',
    confirm: 'உறுதிப்படுத்து',
    correct: 'மீண்டும் பதிவுசெய்',
    previous: 'முந்தையது',
    next: 'அடுத்தது',
    finish: 'படிவம் முடி',
    transcribing: 'உங்கள் பதிலைப் புரிந்துகொள்கிறது...',
    youSaid: 'நீங்கள் சொன்னது:',
    normalizedAs: 'AI அமைக்கப்பட்ட வெளியீடு:',
    isThisCorrect: 'இது சரியா?',
    manualInput: 'எழுத்து மூலம் உள்ளிடுங்கள்',
    voiceInput: 'குரல் உள்ளீட்டிற்கு மாறு',
    saveText: 'பதிலை சேமி',
    enterAnswer: 'உங்கள் பதிலை இங்கே தட்டச்சு செய்யவும்...',
    recordingTimeLeft: 'பதிவு செய்கிறது... தானாக நிற்கும்:',
    sec: 'விநாடி',
    hints: {
      date: '💡 குறிப்பு: நாள், மாதம், வருடத்தை கூறுங்கள்',
      number: '💡 குறிப்பு: எண்களை தெளிவாக கூறுங்கள்',
      choice: '💡 குறிப்பு: கீழே உள்ள விருப்பங்களில் ஒன்றை தேர்வு செய்யுங்கள்',
      signature: '💡 குறிப்பு: உங்கள் முழு சட்டப் பெயரை கூறுங்கள்'
    }
  },
  hindi: {
    field: 'फ़ील्ड',
    of: 'में से',
    listen: 'सुनें',
    record: 'उत्तर रिकॉर्ड करें',
    stopRecording: 'रिकॉर्डिंग बंद करें',
    confirm: 'पुष्टि करें',
    correct: 'पुनः रिकॉर्ड करें',
    previous: 'पिछला',
    next: 'अगला',
    finish: 'फॉर्म पूरा करें',
    transcribing: 'आपका उत्तर समझा जा रहा है...',
    youSaid: 'आपने कहा:',
    normalizedAs: 'AI संरचित उत्तर:',
    isThisCorrect: 'क्या यह सही है?',
    manualInput: 'मैन्युअल रूप से टाइप करें',
    voiceInput: 'वॉइस इनपुट पर स्विच करें',
    saveText: 'उत्तर सहेजें',
    enterAnswer: 'अपना उत्तर यहाँ दर्ज करें...',
    recordingTimeLeft: 'रिकॉर्डिंग जारी है... स्वचालित रोक:',
    sec: 'सेकंड',
    hints: {
      date: '💡 सुझाव: दिन, महीना और वर्ष स्पष्ट रूप से बोलें',
      number: '💡 सुझाव: अंक स्पष्ट रूप से बोलें',
      choice: '💡 सुझाव: दिए गए विकल्पों में से एक बोलें',
      signature: '💡 सुझाव: अपना पूरा नाम बोलें'
    }
  }
};

const STATES = {
  READING: 'reading',
  READY_TO_RECORD: 'ready_to_record',
  RECORDING: 'recording',
  TRANSCRIBING: 'transcribing',
  CONFIRMING: 'confirming',
  MANUAL_TYPING: 'manual_typing'
};

const MAX_RECORD_SECONDS = 30;

const VoiceStage = () => {
  const { language, formData, setFormData, currentFieldIndex, setCurrentFieldIndex, setStage } = useAppContext();
  const [state, setState] = useState(STATES.READING);
  const [rawTranscript, setRawTranscript] = useState('');
  const [transcription, setTranscription] = useState('');
  const [manualText, setManualText] = useState('');
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(MAX_RECORD_SECONDS);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const timerRef = useRef(null);
  const speechReadRef = useRef(false);

  const content = CONTENT[language] || CONTENT.english;
  const { speak, stop, isPlaying } = useSpeechSynthesis(language);
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder();

  const currentField = formData?.fields[currentFieldIndex];
  const totalFields = formData?.fields.length || 0;

  // Auto-speak instructions when entering READING state for a field
  useEffect(() => {
    if (state === STATES.READING && currentField && !speechReadRef.current) {
      speechReadRef.current = true;
      const hint = content.hints[currentField.field_type] || '';
      
      const rawLabel = currentField.simplified_label || currentField.raw_label;
      const instructions = currentField.simplified_instructions || '';
      
      const cleanTextForSpeech = (text) => {
        if (!text) return '';
        return text.replace(/^\d+\.\s*/, '').toLowerCase().replace(/[^a-zA-Z0-9\s.,?]/g, ' ').trim();
      };

      const textToRead = `${cleanTextForSpeech(rawLabel)}. ${cleanTextForSpeech(instructions)}. ${cleanTextForSpeech(hint)}`;
      speak(textToRead);
    }
  }, [state, currentField, speak, content]);

  // Transition to ready state when speech finishes
  useEffect(() => {
    if (state === STATES.READING && speechReadRef.current && !isPlaying) {
      setState(STATES.READY_TO_RECORD);
    }
  }, [state, isPlaying]);

  // Reset speech trigger when field index changes
  useEffect(() => {
    speechReadRef.current = false;
    setState(STATES.READING);
    setTranscription('');
    setRawTranscript('');
    setManualText('');
    setError(null);
  }, [currentFieldIndex]);

  // Handle Recording Timer & 30s auto-stop
  useEffect(() => {
    if (state === STATES.RECORDING) {
      setTimeLeft(MAX_RECORD_SECONDS);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleStopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  // Handle STT Transcribing & AI Normalization
  useEffect(() => {
    if (audioBlob && state === STATES.TRANSCRIBING) {
      const processAudio = async () => {
        try {
          // 1. Transcribe speech using Sarvam/Groq
          const sttRes = await speechToText(audioBlob, language);
          if (sttRes.success && sttRes.transcription) {
            const raw = sttRes.transcription;
            setRawTranscript(raw);

            // 2. AI Normalize answer according to field_type (dates, numbers, text)
            let formatted = raw;
            try {
              const normRes = await normalizeVoiceAnswer(raw, currentField.raw_label, currentField.field_type);
              if (normRes.success && normRes.normalized) {
                formatted = normRes.normalized;
              }
            } catch (normErr) {
              console.warn('Answer normalization fallback:', normErr);
            }

            setTranscription(formatted);
            setState(STATES.CONFIRMING);
            setFailedAttempts(0);

            // Audio confirmation feedback
            speak(`${content.youSaid} ${formatted}. ${content.isThisCorrect}`);
          } else {
            throw new Error('STT returned empty transcription');
          }
        } catch (err) {
          console.error('Speech recognition error:', err);
          const newFailed = failedAttempts + 1;
          setFailedAttempts(newFailed);

          if (newFailed >= 2) {
            setError('Speech recognition having trouble. You can type your answer manually below.');
            setState(STATES.MANUAL_TYPING);
          } else {
            setError('Could not understand speech clearly. Please try speaking again.');
            setState(STATES.READY_TO_RECORD);
          }
          clearRecording();
        }
      };

      processAudio();
    }
  }, [audioBlob, state, language, currentField, content, speak, clearRecording, failedAttempts]);

  // Helper to fix AI mispronunciations of ALL CAPS and leading numbers
  const cleanTextForSpeech = (text) => {
    if (!text) return '';
    return text
      .replace(/^\d+\.\s*/, '') // Remove leading "1. "
      .toLowerCase() // Convert FULL NAME to full name so TTS doesn't read it as acronym
      .replace(/[^a-zA-Z0-9\s.,?]/g, ' ') // Remove weird symbols
      .trim();
  };

  const handleListenAgain = () => {
    stop();
    setState(STATES.READING);
    speechReadRef.current = true; // Mark as read so useEffect doesn't double-trigger
    
    // Call speak directly in the click handler to preserve user gesture context
    const hint = content.hints[currentField.field_type] || '';
    const rawLabel = currentField.simplified_label || currentField.raw_label;
    const instructions = currentField.simplified_instructions || '';
    
    const textToRead = `${cleanTextForSpeech(rawLabel)}. ${cleanTextForSpeech(instructions)}. ${cleanTextForSpeech(hint)}`;
    speak(textToRead);
  };

  const handleStartRecording = async () => {
    stop();
    setError(null);
    const success = await startRecording();
    if (success) {
      setState(STATES.RECORDING);
    } else {
      setError('Microphone access denied or unavailable. Switching to manual typing.');
      setState(STATES.MANUAL_TYPING);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    setState(STATES.TRANSCRIBING);
  };

  const handleConfirmAnswer = (confirmedValue) => {
    const finalAnswer = confirmedValue || transcription || manualText;
    if (!finalAnswer) return;

    const updatedFields = [...formData.fields];
    updatedFields[currentFieldIndex] = {
      ...currentField,
      answer: finalAnswer,
      confirmed: true
    };

    setFormData({
      ...formData,
      fields: updatedFields
    });

    // Advance to next field or summary output stage
    if (currentFieldIndex < totalFields - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    } else {
      setStage('output');
    }
  };

  const handleReRecord = () => {
    setTranscription('');
    setRawTranscript('');
    clearRecording();
    setState(STATES.READY_TO_RECORD);
  };

  const handlePrevious = () => {
    if (currentFieldIndex > 0) {
      stop();
      setCurrentFieldIndex(currentFieldIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentFieldIndex < totalFields - 1) {
      stop();
      setCurrentFieldIndex(currentFieldIndex + 1);
    }
  };

  if (!currentField) return <div className="loading-stage">Loading form fields...</div>;

  const hintText = content.hints[currentField.field_type];

  return (
    <div className="voice-stage">
      <div className="glass-panel" style={{ padding: '2rem' }}>

        {/* Progress Bar & Header */}
        <div className="stage-header">
          <div className="progress-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${((currentFieldIndex + 1) / totalFields) * 100}%` }}
            />
          </div>
          <div className="counter-row">
            <span className="badge-field">
              {content.field} {currentFieldIndex + 1} {content.of} {totalFields}
            </span>
            <span className="badge-type">{currentField.field_type.toUpperCase()}</span>
          </div>
        </div>

        {/* Main Field Card */}
        <div className="field-card">
          <h2 className="field-title">{currentField.simplified_label || currentField.raw_label}</h2>
          {currentField.simplified_instructions && (
            <p className="field-desc">{currentField.simplified_instructions}</p>
          )}

          {/* Options list for choice fields */}
          {currentField.field_type === 'choice' && currentField.options?.length > 0 && (
            <div className="options-grid">
              {currentField.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`option-chip ${transcription === opt ? 'selected' : ''}`}
                  onClick={() => {
                    setTranscription(opt);
                    setState(STATES.CONFIRMING);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Field Hint */}
          {hintText && <div className="field-hint">{hintText}</div>}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-error" role="alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Recording Animation State */}
        {state === STATES.RECORDING && (
          <div className="recording-box">
            <div className="waveform">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
            <p className="recording-timer">
              🔴 {content.recordingTimeLeft} <strong>{timeLeft}{content.sec}</strong>
            </p>
          </div>
        )}

        {/* Transcribing State */}
        {state === STATES.TRANSCRIBING && (
          <div className="transcribing-box">
            <div className="spinner-glow"></div>
            <p>{content.transcribing}</p>
          </div>
        )}

        {/* Confirmation State */}
        {state === STATES.CONFIRMING && (
          <div className="confirm-box">
            {rawTranscript && rawTranscript !== transcription && (
              <p className="raw-said">
                <small>{content.youSaid} "{rawTranscript}"</small>
              </p>
            )}
            <div className="normalized-badge">{content.normalizedAs}</div>
            <div className="answer-preview">"{transcription}"</div>
            <p className="confirm-prompt">{content.isThisCorrect}</p>
          </div>
        )}

        {/* Manual Keyboard Typing Fallback */}
        {state === STATES.MANUAL_TYPING && (
          <div className="manual-input-box">
            <input
              type="text"
              className="input-field"
              placeholder={content.enterAnswer}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              autoFocus
            />
            <button
              className="btn-control btn-confirm"
              onClick={() => handleConfirmAnswer(manualText)}
              disabled={!manualText.trim()}
            >
              ✓ {content.saveText}
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="controls-group">

          {/* Listen Button */}
          {(state === STATES.READY_TO_RECORD || state === STATES.READING) && (
            <button
              className="btn-control btn-listen"
              onClick={handleListenAgain}
              disabled={isPlaying}
            >
              <span className="icon">🔊</span>
              <span>{content.listen}</span>
            </button>
          )}

          {/* Record Button */}
          {(state === STATES.READY_TO_RECORD || state === STATES.READING) && (
            <button
              className="btn-control btn-record"
              onClick={handleStartRecording}
            >
              <span className="icon">🎤</span>
              <span>{content.record}</span>
            </button>
          )}

          {/* Stop Recording */}
          {state === STATES.RECORDING && (
            <button
              className="btn-control btn-stop-rec"
              onClick={handleStopRecording}
            >
              <span className="icon">⏹</span>
              <span>{content.stopRecording}</span>
            </button>
          )}

          {/* Confirm & Re-record controls */}
          {state === STATES.CONFIRMING && (
            <>
              <button
                className="btn-control btn-rerecord"
                onClick={handleReRecord}
              >
                <span className="icon">✏️</span>
                <span>{content.correct}</span>
              </button>
              <button
                className="btn-control btn-confirm"
                onClick={() => handleConfirmAnswer(transcription)}
              >
                <span className="icon">✓</span>
                <span>{content.confirm}</span>
              </button>
            </>
          )}

          {/* Toggle Manual Typing */}
          {state !== STATES.RECORDING && state !== STATES.TRANSCRIBING && (
            <button
              className="btn-toggle-manual"
              onClick={() => {
                if (state === STATES.MANUAL_TYPING) {
                  setState(STATES.READY_TO_RECORD);
                } else {
                  setState(STATES.MANUAL_TYPING);
                }
              }}
            >
              ⌨️ {state === STATES.MANUAL_TYPING ? content.voiceInput : content.manualInput}
            </button>
          )}
        </div>

        {/* Nav Buttons */}
        <div className="nav-row">
          <button
            className="btn-nav"
            onClick={handlePrevious}
            disabled={currentFieldIndex === 0 || state === STATES.RECORDING}
          >
            ← {content.previous}
          </button>

          {currentFieldIndex < totalFields - 1 ? (
            <button
              className="btn-nav"
              onClick={handleNext}
              disabled={state === STATES.RECORDING}
            >
              {content.next} →
            </button>
          ) : (
            <button
              className="btn-nav btn-finish-nav"
              onClick={() => setStage('output')}
              disabled={state === STATES.RECORDING}
            >
              ✓ {content.finish}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default VoiceStage;
