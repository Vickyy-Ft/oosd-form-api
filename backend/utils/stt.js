import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * Speech-to-Text prioritizing Sarvam AI (Indic Saarika v2.5 model),
 * falling back to Groq Whisper.
 */
export async function speechToText(audioPath, language = 'english') {
  const sarvamApiKey = process.env.SARVAM_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  const sarvamLanguageMap = {
    'english': 'en-IN',
    'tamil': 'ta-IN',
    'hindi': 'hi-IN'
  };

  const groqLanguageMap = {
    'english': 'en',
    'tamil': 'ta',
    'hindi': 'hi'
  };

  // 1. Try Sarvam AI STT (Saarika v2.5 model)
  if (sarvamApiKey) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioPath));
      formData.append('model', 'saarika:v2.5');
      if (sarvamLanguageMap[language]) {
        formData.append('language_code', sarvamLanguageMap[language]);
      }

      const response = await axios.post(
        'https://api.sarvam.ai/speech-to-text',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'api-subscription-key': sarvamApiKey
          },
          timeout: 30000
        }
      );

      const transcript = response.data.transcript || response.data.text;
      if (transcript) {
        return {
          transcription: transcript,
          confidence: 1.0,
          provider: 'sarvam',
          success: true
        };
      }
    } catch (sarvamError) {
      console.warn('Sarvam STT fallback due to error:', sarvamError.response?.data || sarvamError.message);
    }
  }

  // 2. Fallback to Groq Whisper
  if (groqApiKey) {
    try {
      const whisperLanguage = groqLanguageMap[language] || 'en';
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioPath));
      formData.append('model', 'whisper-large-v3');
      formData.append('language', whisperLanguage);
      formData.append('response_format', 'json');

      const response = await axios.post(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${groqApiKey}`
          },
          timeout: 30000
        }
      );

      return {
        transcription: response.data.text,
        confidence: 1.0,
        provider: 'groq',
        success: true
      };

    } catch (groqError) {
      console.error('Groq STT error:', groqError.response?.data || groqError.message);
      throw new Error(`Failed to transcribe audio: ${groqError.message}`);
    }
  }

  throw new Error('No STT API keys configured (SARVAM_API_KEY or GROQ_API_KEY required)');
}
