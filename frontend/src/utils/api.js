import axios from 'axios';

const API_BASE_URL = 'https://oosd-form-api.onrender.com/api';

/**
 * Extract form fields from image
 */
export async function extractFormFields(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await axios.post(`${API_BASE_URL}/extract`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 120000 // 120 seconds
  });

  return response.data;
}

/**
 * Simplify and translate form fields
 */
export async function simplifyAndTranslate(formData, language) {
  const response = await axios.post(`${API_BASE_URL}/simplify-translate`, {
    formData,
    language
  }, {
    timeout: 120000
  });

  return response.data;
}

/**
 * Normalize a raw voice transcription to correct field format
 */
export async function normalizeVoiceAnswer(transcript, fieldLabel, fieldType) {
  const response = await axios.post(`${API_BASE_URL}/simplify-translate/normalize`, {
    transcript,
    fieldLabel,
    fieldType
  }, {
    timeout: 15000
  });

  return response.data;
}


/**
 * Text to speech
 */
export async function textToSpeech(text, language) {
  const response = await axios.post(`${API_BASE_URL}/tts`, {
    text,
    language
  }, {
    timeout: 30000
  });

  return response.data;
}

/**
 * Speech to text
 */
export async function speechToText(audioBlob, language) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('language', language);

  const response = await axios.post(`${API_BASE_URL}/stt`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000
  });

  return response.data;
}

/**
 * Generate output (PDF or summary)
 */
export async function generateOutput(formData, language) {
  const response = await axios.post(`${API_BASE_URL}/generate-output`, {
    formData,
    language
  }, {
    timeout: 60000
  });

  return response.data;
}

/**
 * Delete session
 */
export async function deleteSession(sessionId) {
  const response = await axios.delete(`${API_BASE_URL}/session/${sessionId}`);
  return response.data;
}
