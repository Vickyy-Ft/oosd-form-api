import axios from 'axios';

const VOICE_CONFIG = {
  tamil: { target_language_code: 'ta-IN', speaker: 'anushka', lang: 'ta-IN', rate: 0.9 },
  hindi: { target_language_code: 'hi-IN', speaker: 'anushka', lang: 'hi-IN', rate: 0.9 },
  english: { target_language_code: 'en-IN', speaker: 'anushka', lang: 'en-IN', rate: 1.0 }
};

/**
 * Text-to-Speech using Sarvam AI (bulbul:v2 model for high-quality Indic voice)
 * Fallback to browser Web Speech API metadata if Sarvam fails.
 */
export async function textToSpeech(text, language = 'english') {
  const apiKey = process.env.SARVAM_API_KEY;
  const config = VOICE_CONFIG[language] || VOICE_CONFIG.english;

  if (apiKey) {
    try {
      const response = await axios.post(
        'https://api.sarvam.ai/text-to-speech',
        {
          inputs: [text],
          target_language_code: config.target_language_code,
          speaker: config.speaker,
          model: 'bulbul:v2',
          speech_sample_rate: 24000
        },
        {
          headers: {
            'api-subscription-key': apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.data?.audios?.[0]) {
        return {
          audioContent: response.data.audios[0],
          mockAudio: false,
          browserTTS: false,
          provider: 'sarvam',
          text,
          language
        };
      }
    } catch (error) {
      console.warn('Sarvam TTS fallback due to error:', error.response?.data || error.message);
    }
  }

  // Fallback to browser TTS metadata
  return {
    audioContent: null,
    mockAudio: true,
    browserTTS: true,
    text,
    language,
    lang: config.lang,
    rate: config.rate,
    pitch: 1.0
  };
}

// Cache for generated audio (1 hour TTL)
const ttsCache = new Map();

export async function textToSpeechCached(text, language = 'english') {
  const cacheKey = `${language}:${text}`;

  if (ttsCache.has(cacheKey)) {
    return ttsCache.get(cacheKey);
  }

  const result = await textToSpeech(text, language);

  if (result.audioContent || result.browserTTS) {
    ttsCache.set(cacheKey, result);
    setTimeout(() => ttsCache.delete(cacheKey), 3600000);
  }

  return result;
}
