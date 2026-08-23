import express from 'express';
import { simplifyAndTranslate, normalizeAnswer } from '../utils/llm.js';

const router = express.Router();

/**
 * POST /api/simplify-translate
 * Simplify all form fields at once and translate to target language
 */
router.post('/', async (req, res) => {
  try {
    const { formData, language } = req.body;

    if (!formData?.fields) {
      return res.status(400).json({ success: false, error: 'Invalid form data provided' });
    }

    if (!['english', 'tamil', 'hindi'].includes(language)) {
      return res.status(400).json({ success: false, error: 'Language must be: english, tamil, or hindi' });
    }

    const processedFields = await simplifyAndTranslate(formData.fields, language);

    res.json({
      success: true,
      formData: { ...formData, fields: processedFields }
    });

  } catch (error) {
    console.error('Simplify/translate error:', error.message);
    res.status(500).json({ success: false, error: error.message || 'Failed to process fields' });
  }
});

/**
 * POST /api/simplify-translate/normalize
 * Normalize a raw voice transcription to the correct format for a field
 */
router.post('/normalize', async (req, res) => {
  try {
    const { transcript, fieldLabel, fieldType } = req.body;

    if (!transcript || !fieldLabel) {
      return res.status(400).json({ success: false, error: 'transcript and fieldLabel are required' });
    }

    const normalized = await normalizeAnswer(transcript, fieldLabel, fieldType || 'text');

    res.json({ success: true, normalized });

  } catch (error) {
    console.error('Normalize error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
