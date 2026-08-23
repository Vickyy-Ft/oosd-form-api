import axios from 'axios';

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const SARVAM_API_BASE = 'https://api.sarvam.ai';

// ─── API Key helpers ───────────────────────────────────────────────────────────

function getGroqApiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not set in .env');
  return key;
}

function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set in .env');
  return key;
}

function getSarvamApiKey() {
  return process.env.SARVAM_API_KEY || null;
}

// ─── Retry wrapper ─────────────────────────────────────────────────────────────

async function withRetry(fn, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRetryable = err.response?.status === 429 || err.response?.status >= 500 || err.code === 'ECONNABORTED';
      if (!isRetryable || attempt === maxRetries) throw err;
      const wait = delayMs * Math.pow(2, attempt - 1); // exponential backoff
      console.warn(`Retry ${attempt}/${maxRetries} after ${wait}ms — ${err.message}`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

// ─── Groq: text chat ──────────────────────────────────────────────────────────

async function groqChat({ model = 'compound-beta', messages, temperature = 0.1, max_tokens = 4000 }) {
  return withRetry(async () => {
    const response = await axios.post(
      `${GROQ_API_BASE}/chat/completions`,
      { model, messages, temperature, max_tokens },
      {
        headers: {
          'Authorization': `Bearer ${getGroqApiKey()}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    return response.data.choices[0].message.content;
  });
}

// ─── Gemini: vision (accepts imageBuffer OR imagePath) ────────────────────────

async function geminiVision({ imageBuffer, mimeType = 'image/jpeg', prompt }) {
  const apiKey = getGeminiApiKey();
  const base64Image = imageBuffer.toString('base64');

  return withRetry(async () => {
    const response = await axios.post(
      `${GEMINI_API_BASE}/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Image } },
              { text: prompt }
            ]
          }
        ],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      }
    );

    const parts = response.data.candidates[0].content?.parts || [];
    const textPart = parts.find(p => p.text && !p.thoughtSignature) || parts[0];
    return textPart?.text || '';
  });
}

// ─── Sarvam: translate ────────────────────────────────────────────────────────

const SARVAM_LANG_MAP = {
  tamil: 'ta-IN',
  hindi: 'hi-IN',
  english: 'en-IN'
};

async function sarvamTranslate(text, targetLanguage) {
  const apiKey = getSarvamApiKey();
  if (!apiKey || targetLanguage === 'english') return text; // No-op for English

  try {
    const response = await axios.post(
      `${SARVAM_API_BASE}/translate`,
      {
        input: text,
        source_language_code: 'en-IN',
        target_language_code: SARVAM_LANG_MAP[targetLanguage] || 'en-IN',
        speaker_gender: 'Female',
        mode: 'formal',
        enable_preprocessing: false
      },
      {
        headers: {
          'api-subscription-key': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    return response.data.translated_text || text;
  } catch (err) {
    console.warn('Sarvam translate fallback:', err.response?.data || err.message);
    return text; // Return original on failure
  }
}

// ─── Exported: Extract form fields from image buffer ─────────────────────────

const EXTRACTION_PROMPT = `You are analyzing a government form image. Extract ALL fields that require user input.

For each field provide:
- field_id: unique identifier (field_001, field_002, ...)
- raw_label: exact field label text as seen on form
- field_type: one of: text | date | number | choice | signature
- raw_instructions: any helper text, examples, or format hints shown
- required_documents: list any supporting documents mentioned
- options: for choice fields, list the available options as an array (otherwise empty array)

Return ONLY valid JSON, no extra text:
{
  "form_id": "descriptive_form_name",
  "fields": [
    {
      "field_id": "field_001",
      "raw_label": "string",
      "field_type": "text|date|number|choice|signature",
      "raw_instructions": "string",
      "required_documents": ["string"],
      "options": []
    }
  ]
}

Handle skewed images, poor lighting, and mixed scripts. Best-effort inference for unclear fields.`;

export async function extractFieldsWithVision({ imageBuffer, mimeType = 'image/jpeg' }) {
  try {
    const content = await geminiVision({ imageBuffer, mimeType, prompt: EXTRACTION_PROMPT });

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON in Gemini response');

    const formData = JSON.parse(jsonMatch[0]);
    if (!formData.form_id || !Array.isArray(formData.fields)) {
      throw new Error('Invalid form data structure from Gemini');
    }

    return formData;
  } catch (error) {
    console.error('Vision extraction error:', error.message);
    throw new Error(`Failed to extract form fields: ${error.message}`);
  }
}

// ─── Exported: Simplify + Translate (batched, one call) ──────────────────────

export async function simplifyAndTranslate(fields, language) {
  const targetLanguage = language || 'english';

  // Step 1: Simplify all fields in one Groq call
  const fieldSummary = fields.map(f =>
    `ID: ${f.field_id} | Type: ${f.field_type} | Label: "${f.raw_label}" | Instructions: "${f.raw_instructions || 'none'}"`
  ).join('\n');

  const simplifyPrompt = `Rewrite each government form field below at a 5th-grade reading level in simple English.
Use clear, friendly words. Preserve all legal requirements and format hints.

Fields:
${fieldSummary}

Return ONLY a JSON array, no extra text:
[
  {
    "field_id": "field_001",
    "simplified_label": "simple English label",
    "simplified_instructions": "simple English instructions"
  }
]`;

  let simplifiedFields = fields.map(f => ({
    ...f,
    simplified_label: f.raw_label,
    simplified_instructions: f.raw_instructions || ''
  }));

  try {
    const content = await groqChat({
      messages: [{ role: 'user', content: simplifyPrompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const simplified = JSON.parse(jsonMatch[0]);
      simplifiedFields = fields.map(field => {
        const s = simplified.find(x => x.field_id === field.field_id);
        return {
          ...field,
          simplified_label: s?.simplified_label || field.raw_label,
          simplified_instructions: s?.simplified_instructions || field.raw_instructions || ''
        };
      });
    }
  } catch (err) {
    console.warn('Groq simplify error, using originals:', err.message);
  }

  // Step 2: Translate using Sarvam AI (if not English)
  if (targetLanguage !== 'english') {
    simplifiedFields = await Promise.all(
      simplifiedFields.map(async field => ({
        ...field,
        simplified_label: await sarvamTranslate(field.simplified_label, targetLanguage),
        simplified_instructions: await sarvamTranslate(field.simplified_instructions, targetLanguage)
      }))
    );
  }

  return simplifiedFields;
}

// ─── Exported: Normalize/validate a voice answer ─────────────────────────────

export async function normalizeAnswer(rawTranscript, fieldLabel, fieldType) {
  const prompt = `A user spoke their answer to a government form field via voice. Convert it to the correct format.

Field: "${fieldLabel}"
Field type: ${fieldType}
User said: "${rawTranscript}"

Rules:
- date → format as DD/MM/YYYY (e.g. "twenty third august nineteen ninety" → "23/08/1990")
- number → digits only (e.g. "twelve thousand five hundred" → "12500")
- text → clean up, fix obvious speech-to-text errors, capitalize names properly
- choice → return just the selected option text
- signature → return "To be signed physically"

Return ONLY a valid JSON object with a single key "answer". Do not include ANY reasoning or markdown.
Example: {"answer": "Seva"}`;

  try {
    const content = await groqChat({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.0,
      max_tokens: 150
    });
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.answer || rawTranscript;
    }
    return content.trim(); // Fallback if it didn't return JSON
  } catch (err) {
    console.warn('Answer normalization failed, using raw transcript:', err.message);
    return rawTranscript;
  }
}
