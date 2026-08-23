# API Documentation

Complete documentation for the Accessible Form Assistant API.

## Base URL

**Development**: `http://localhost:3001/api`  
**Production**: `https://your-domain.com/api`

## Authentication

Currently, the API does not require authentication for end users. API keys for third-party services (OpenAI, Google Cloud) are managed server-side.

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP address
- **Response on limit exceeded**: 429 Too Many Requests
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

## Common Headers

### Request Headers
```
Content-Type: application/json
Accept: application/json
```

### Response Headers
```
Content-Type: application/json
Access-Control-Allow-Origin: [configured-frontend-url]
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `413` - Payload Too Large
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Endpoints

### 1. Health Check

Check if the API is running and healthy.

**Endpoint**: `GET /api/health`

**Parameters**: None

**Response**: 200 OK
```json
{
  "status": "healthy",
  "timestamp": "2026-08-22T10:30:00.000Z",
  "version": "1.0.0"
}
```

**Example**:
```bash
curl http://localhost:3001/api/health
```

---

### 2. Extract Form Fields

Extract form fields from an uploaded image using vision AI.

**Endpoint**: `POST /api/extract`

**Content-Type**: `multipart/form-data`

**Parameters**:
- `image` (file, required): Form image file
  - Formats: JPEG, PNG, WebP, PDF
  - Max size: 10MB

**Response**: 200 OK
```json
{
  "success": true,
  "formData": {
    "form_id": "disability_certificate_application",
    "fields": [
      {
        "field_id": "field_001",
        "raw_label": "Applicant Name",
        "field_type": "text",
        "raw_instructions": "Enter your full name as per Aadhaar card",
        "required_documents": ["Aadhaar Card"],
        "simplified_label": "",
        "simplified_instructions": "",
        "answer": null,
        "confirmed": false,
        "choices": []
      }
    ]
  }
}
```

**Error Responses**:
- `400` - No image provided or invalid file type
- `413` - File size exceeds 10MB
- `500` - Vision extraction failed

**Example**:
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('http://localhost:3001/api/extract', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

**Processing Time**: 10-30 seconds depending on image complexity

---

### 3. Simplify and Translate

Simplify field instructions to 5th-grade reading level and translate to target language.

**Endpoint**: `POST /api/simplify-translate`

**Content-Type**: `application/json`

**Parameters**:
```json
{
  "formData": {
    "form_id": "string",
    "fields": [/* array of fields */]
  },
  "language": "english" | "tamil" | "hindi"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "formData": {
    "form_id": "disability_certificate_application",
    "fields": [
      {
        "field_id": "field_001",
        "raw_label": "Applicant Name",
        "field_type": "text",
        "raw_instructions": "Enter your full name as per Aadhaar card",
        "required_documents": ["Aadhaar Card"],
        "simplified_label": "Your Full Name",
        "simplified_instructions": "Write your complete name exactly as it appears on your Aadhaar card",
        "answer": null,
        "confirmed": false
      }
    ]
  }
}
```

**Error Responses**:
- `400` - Invalid form data or language
- `500` - Simplification/translation failed

**Example**:
```javascript
const response = await fetch('http://localhost:3001/api/simplify-translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formData: extractedFormData,
    language: 'tamil'
  })
});
```

**Processing Time**: 15-25 seconds for typical form

---

### 4. Text to Speech

Convert text to speech audio.

**Endpoint**: `POST /api/tts`

**Content-Type**: `application/json`

**Parameters**:
```json
{
  "text": "string (required)",
  "language": "english" | "tamil" | "hindi"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "audioContent": "base64_encoded_mp3_data",
  "mockAudio": false
}
```

**OR** (when TTS service not configured):
```json
{
  "success": true,
  "mockAudio": true,
  "message": "TTS service not configured. Using mock audio.",
  "text": "original text",
  "language": "english"
}
```

**Error Responses**:
- `400` - Missing text or invalid language
- `500` - TTS generation failed

**Example**:
```javascript
const response = await fetch('http://localhost:3001/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Enter your full name',
    language: 'english'
  })
});

const data = await response.json();

if (!data.mockAudio) {
  // Convert base64 to audio
  const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}
```

**Processing Time**: 1-3 seconds

**Caching**: Common phrases cached for 1 hour

---

### 5. Speech to Text

Transcribe speech audio to text.

**Endpoint**: `POST /api/stt`

**Content-Type**: `multipart/form-data`

**Parameters**:
- `audio` (file, required): Audio recording
  - Formats: WebM, MP4, MPEG, WAV, OGG
  - Max size: 25MB
- `language` (string, required): "english" | "tamil" | "hindi"

**Response**: 200 OK
```json
{
  "success": true,
  "transcription": "Ramesh Kumar",
  "confidence": 1.0
}
```

**Error Responses**:
- `400` - No audio provided or invalid language
- `500` - Transcription failed

**Example**:
```javascript
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.webm');
formData.append('language', 'english');

const response = await fetch('http://localhost:3001/api/stt', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log('User said:', data.transcription);
```

**Processing Time**: 3-10 seconds depending on audio length

---

### 6. Generate Output

Generate filled PDF or text summary from completed form data.

**Endpoint**: `POST /api/generate-output`

**Content-Type**: `application/json`

**Parameters**:
```json
{
  "formData": {
    "form_id": "string",
    "fields": [/* fields with answers */]
  },
  "language": "english" | "tamil" | "hindi"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "output_type": "pdf" | "summary",
  "download_url": "/api/downloads/disability_certificate_filled_1234567890.pdf",
  "filename": "disability_certificate_filled_1234567890.pdf"
}
```

**Error Responses**:
- `400` - Invalid form data or language
- `500` - Output generation failed

**Example**:
```javascript
const response = await fetch('http://localhost:3001/api/generate-output', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formData: completedFormData,
    language: 'english'
  })
});

const data = await response.json();

// Download the file
window.location.href = data.download_url;
```

**Processing Time**: 5-15 seconds

**File Lifecycle**: Generated files automatically deleted after 1 hour

---

### 7. Delete Session

Clean up session data (currently minimal implementation).

**Endpoint**: `DELETE /api/session/:sessionId`

**Parameters**:
- `sessionId` (path parameter): Session identifier

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Session cleaned up successfully"
}
```

**Example**:
```javascript
const response = await fetch(`http://localhost:3001/api/session/${sessionId}`, {
  method: 'DELETE'
});
```

---

### 8. Download File

Download generated output file.

**Endpoint**: `GET /api/downloads/:filename`

**Parameters**:
- `filename` (path parameter): Filename returned from generate-output endpoint

**Response**: File download (PDF or TXT)

**Example**:
```javascript
// Direct download
window.location.href = '/api/downloads/form_12345.pdf';

// Or fetch
const response = await fetch('/api/downloads/form_12345.pdf');
const blob = await response.blob();
const url = URL.createObjectURL(blob);
```

**Note**: Files are automatically deleted after 1 hour

---

## Data Types

### FormData
```typescript
{
  form_id: string;
  fields: FormField[];
}
```

### FormField
```typescript
{
  field_id: string;
  raw_label: string;
  field_type: 'text' | 'date' | 'number' | 'choice' | 'signature';
  raw_instructions: string;
  required_documents: string[];
  simplified_label: string;
  simplified_instructions: string;
  answer: string | null;
  confirmed: boolean;
  choices?: string[];  // for 'choice' type fields
}
```

---

## Workflow Example

Complete workflow for filling a form:

```javascript
// 1. Extract form fields
const extractFormData = new FormData();
extractFormData.append('image', imageFile);
const extractResponse = await fetch('/api/extract', {
  method: 'POST',
  body: extractFormData
});
const { formData } = await extractResponse.json();

// 2. Simplify and translate
const simplifyResponse = await fetch('/api/simplify-translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ formData, language: 'english' })
});
const { formData: simplifiedFormData } = await simplifyResponse.json();

// 3. For each field...
for (const field of simplifiedFormData.fields) {
  // 3a. Read field instructions
  const ttsResponse = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `${field.simplified_label}. ${field.simplified_instructions}`,
      language: 'english'
    })
  });
  // Play audio...
  
  // 3b. Record user's answer
  const audioBlob = await recordAudio();
  
  // 3c. Transcribe answer
  const sttFormData = new FormData();
  sttFormData.append('audio', audioBlob);
  sttFormData.append('language', 'english');
  const sttResponse = await fetch('/api/stt', {
    method: 'POST',
    body: sttFormData
  });
  const { transcription } = await sttResponse.json();
  
  // 3d. Save answer
  field.answer = transcription;
  field.confirmed = true;
}

// 4. Generate output
const outputResponse = await fetch('/api/generate-output', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ formData: simplifiedFormData, language: 'english' })
});
const { download_url } = await outputResponse.json();

// 5. Download
window.location.href = download_url;
```

---

## Best Practices

### Performance
1. **Cache TTS responses** for repeated phrases
2. **Compress images** before upload (client-side)
3. **Use appropriate timeouts** (30-60 seconds for LLM calls)
4. **Batch simplification** when possible

### Error Handling
1. **Always handle errors** from API calls
2. **Provide user-friendly messages** for failures
3. **Implement retry logic** for transient errors
4. **Fall back gracefully** (e.g., Web Speech API for TTS)

### Security
1. **Never expose API keys** on client side
2. **Validate file sizes** before upload
3. **Sanitize user input** (though APIs handle this)
4. **Use HTTPS** in production

### Privacy
1. **Delete temporary files** immediately
2. **Don't log sensitive data** (form content, audio)
3. **Clear session data** on completion
4. **Don't cache API responses** containing user data

---

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Extract (with file)
curl -X POST http://localhost:3001/api/extract \
  -F "image=@/path/to/form.jpg"

# Simplify-translate
curl -X POST http://localhost:3001/api/simplify-translate \
  -H "Content-Type: application/json" \
  -d '{"formData": {...}, "language": "english"}'

# TTS
curl -X POST http://localhost:3001/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "language": "english"}'
```

### Using Postman

1. Import the API collection (create from these docs)
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:3001/api`
3. Test each endpoint individually
4. Chain requests for full workflow testing

---

## Troubleshooting

### Common Issues

**Issue**: "OPENAI_API_KEY not configured"
- **Solution**: Add API key to backend `.env` file

**Issue**: "File size exceeds 10MB"
- **Solution**: Compress image before upload or reduce resolution

**Issue**: "Failed to extract form fields"
- **Solution**: Ensure image is clear, well-lit, and contains a visible form

**Issue**: "Transcription failed"
- **Solution**: Check audio quality, reduce background noise, try again

**Issue**: CORS errors
- **Solution**: Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL

---

## Rate Limits and Quotas

### API Rate Limits
- **Requests**: 100 per 15 minutes per IP
- **File Size**: 10MB for images, 25MB for audio
- **Timeout**: 60 seconds per request

### Third-Party API Limits
- **OpenAI**: Based on your account tier
- **Google Cloud TTS**: 1 million characters/month free tier

---

## Support

For API issues:
1. Check this documentation
2. Review error messages
3. Test with sample data
4. Check backend logs
5. Verify API keys are valid

---

**Version**: 1.0.0  
**Last Updated**: August 22, 2026  
**Base URL**: `http://localhost:3001/api` (development)
