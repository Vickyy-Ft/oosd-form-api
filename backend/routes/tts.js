import express from 'express';
import { textToSpeechCached } from '../utils/tts.js';

const router = express.Router();

/**
 * POST /api/tts
 * Convert text to speech
 */
router.post('/', async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const lang = language || 'english';
    if (!['english', 'tamil', 'hindi'].includes(lang)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language. Must be: english, tamil, or hindi'
      });
    }

    const result = await textToSpeechCached(text, lang);

    if (result.browserTTS || result.mockAudio || !result.audioContent) {
      // Tell frontend to use browser's built-in Web Speech API
      return res.json({
        success: true,
        browserTTS: true,
        mockAudio: true,       // keep for backward compat with older frontend builds
        text: result.text,
        language: result.language,
        lang: result.lang,
        rate: result.rate,
        pitch: result.pitch
      });
    }

    // Return base64 encoded audio (for future real TTS providers)
    res.json({
      success: true,
      audioContent: result.audioContent,
      mockAudio: false
    });

  } catch (error) {
    console.error('TTS error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate speech'
    });
  }
});

export default router;
