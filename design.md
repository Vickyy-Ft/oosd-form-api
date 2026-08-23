# Design Document

## System Architecture

### High-Level Overview

The Accessible Form Assistant follows a client-server architecture with a mobile-first React frontend and a lightweight backend API layer that proxies external AI services. The system processes government forms through five sequential stages:

1. **Image Capture** → User photographs or uploads form
2. **Vision Extraction** → Multimodal LLM extracts structured field data
3. **Simplification & Translation** → LLM rewrites instructions at 5th-grade level in target language
4. **Voice Interaction** → TTS/STT enables audio-first form completion
5. **Output Generation** → Creates filled PDF (for pre-mapped forms) or fallback summary

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend (PWA)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Camera/    │  │    Voice     │  │   Output     │      │
│  │   Upload UI  │  │  Interface   │  │   Preview    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend API (Node/Express)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Vision     │  │  Simplify/   │  │     PDF      │      │
│  │   Proxy      │  │  Translate   │  │  Generator   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
└─────────┼──────────────────┼──────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Multimodal LLM │  │   Google Cloud  │  │  Whisper API    │
│  (GPT-4o/Claude)│  │      TTS        │  │   (OpenAI)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18+ with functional components and hooks
- **Build Tool**: Vite for fast development and optimized production builds
- **PWA**: Workbox for service worker management and offline manifest
- **Styling**: CSS Modules with mobile-first responsive design
- **Accessibility**: ARIA attributes, semantic HTML, focus management
- **State Management**: React Context API for session state and language preference
- **HTTP Client**: Fetch API with error handling and retry logic

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js for RESTful API endpoints
- **File Upload**: Multer middleware with file size validation
- **PDF Generation**: pdf-lib for template-based PDF filling
- **Environment Config**: dotenv for API key management
- **Security**: Helmet.js, CORS, rate limiting with express-rate-limit

### External Services
- **Vision & Simplification**: GPT-4o or Claude 3.5 Sonnet (multimodal LLM)
- **Text-to-Speech**: Google Cloud Text-to-Speech (Tamil, English, Hindi support)
- **Speech-to-Text**: OpenAI Whisper API (primary), Web Speech API (fallback)

## Data Models

### Field Schema (Core Data Contract)

```typescript
interface FormData {
  form_id: string;               // Unique identifier for this form session
  fields: FormField[];           // Array of all fields in the form
}

interface FormField {
  field_id: string;              // Unique identifier for this field
  raw_label: string;             // Original field label from form image
  field_type: FieldType;         // Type of input expected
  raw_instructions: string;      // Original instructions text
  required_documents: string[];  // List of supporting docs needed
  simplified_label: string;      // 5th-grade reading level label
  simplified_instructions: string; // 5th-grade reading level instructions
  answer: string | null;         // User's provided answer
  confirmed: boolean;            // Whether user confirmed this answer
}

type FieldType = 'text' | 'date' | 'number' | 'choice' | 'signature';
```

### Session State

```typescript
interface SessionState {
  sessionId: string;
  language: 'tamil' | 'english' | 'hindi';
  formData: FormData | null;
  currentFieldIndex: number;
  stage: 'capture' | 'extracting' | 'simplifying' | 'voice' | 'output';
  uploadedImage: File | null;
}
```

### Pre-Mapped Form Templates

```typescript
interface FormTemplate {
  template_id: string;
  form_name: string;            // e.g., "disability_certificate_application"
  pdf_path: string;             // Path to blank PDF template
  field_mappings: FieldMapping[];
}

interface FieldMapping {
  field_id: string;             // Matches field_id from extraction
  pdf_field_name: string;       // Name of field in PDF form
  page_number: number;          // Page where field appears
  coordinates?: {               // For non-form PDFs
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

## Component Architecture

### Frontend Components

```
App
├── LanguageSelector
├── PrivacyNotice
├── NetworkStatus
└── MainWorkflow
    ├── CaptureStage
    │   ├── CameraCapture
    │   └── FileUpload
    ├── ProcessingStage
    │   └── LoadingIndicator
    ├── VoiceStage
    │   ├── FieldNavigator
    │   ├── AudioPlayer (TTS)
    │   ├── VoiceRecorder (STT)
    │   └── ConfirmationDialog
    └── OutputStage
        ├── OutputPreview
        └── DownloadButton
```

### Backend API Endpoints

```
POST /api/extract
  - Body: multipart/form-data with 'image' field
  - Returns: { form_id, fields: FormField[] }

POST /api/simplify
  - Body: { fields: FormField[], language: string }
  - Returns: { fields: FormField[] } (with simplified_* populated)

POST /api/tts
  - Body: { text: string, language: string }
  - Returns: audio/mpeg stream

POST /api/stt
  - Body: multipart/form-data with 'audio' field, language param
  - Returns: { transcription: string }

POST /api/generate-output
  - Body: { form_id: string, fields: FormField[], language: string }
  - Returns: { output_type: 'pdf' | 'summary', download_url: string }

DELETE /api/session/:sessionId
  - Cleanup endpoint to delete session data
```

## Key Design Decisions

### 1. Vision Extraction Prompt Engineering

The success of the entire system depends on accurate field extraction. The prompt sent to the multimodal LLM must be carefully engineered:

```
You are analyzing a government form image. Extract all fields that require user input.

For each field, provide:
- field_id: a unique identifier (use format: field_001, field_002, etc.)
- raw_label: the exact text of the field label as it appears
- field_type: classify as text, date, number, choice, or signature
- raw_instructions: any helper text, examples, or requirements shown
- required_documents: list any supporting documents mentioned

Return ONLY valid JSON matching this exact structure:
{
  "form_id": "extracted_form_name_or_type",
  "fields": [
    {
      "field_id": "string",
      "raw_label": "string",
      "field_type": "text|date|number|choice|signature",
      "raw_instructions": "string",
      "required_documents": ["string"]
    }
  ]
}

Handle skewed images, handwritten text, and varied layouts. If a field is unclear, make your best inference.
```

**Testing Strategy**: Validate against 3-4 real forms with varying quality (skewed angles, handwriting, poor lighting) before proceeding to other stages.

### 2. Simplification & Translation Approach

The simplification happens in two LLM calls:
1. **Simplification**: Rewrite at 5th-grade level in English
2. **Translation**: Convert simplified English to target language

This two-step approach ensures consistent simplification logic while leveraging the LLM's strong English performance.

```
Simplification Prompt:
Rewrite the following government form field instruction at a 5th-grade reading level.
Preserve all legal requirements but use simple words and short sentences.

Original: "{raw_instructions}"

Return ONLY the simplified text, no explanations.
```

```
Translation Prompt:
Translate the following simplified form instruction to {target_language}.
Maintain the simple, clear tone.

Text: "{simplified_instructions}"

Return ONLY the translation, no explanations.
```

### 3. Audio Interface State Machine

The voice interface follows a strict state machine to ensure reliable audio interaction:

```
States:
  READING → playing TTS audio of field instruction
  LISTENING → recording user's voice answer
  CONFIRMING → playing back transcription and waiting for confirmation
  CORRECTING → re-prompting for answer after user rejection

Transitions:
  READING → LISTENING (when TTS completes)
  LISTENING → CONFIRMING (when STT transcription available)
  CONFIRMING → next field (user confirms)
  CONFIRMING → CORRECTING (user rejects)
  CORRECTING → LISTENING (ready for new answer)
```

Large touch targets (48x48px minimum) for Previous/Next/Confirm/Reject buttons ensure usability for low-vision users.

### 4. Accessibility Implementation

**Screen Reader Support**:
- All interactive elements have explicit `aria-label` attributes
- State changes announced via `aria-live` regions
- Focus management ensures logical tab order
- Skip links allow bypassing repetitive navigation

**Visual Accessibility**:
- Minimum touch target size: 48x48 CSS pixels
- High contrast color scheme (WCAG AA minimum)
- Large, clear fonts (minimum 16px body text)
- No color-only information conveyance

**Audio-First Design**:
- Every UI action has an audio equivalent
- Visual feedback supplementary, never required
- Voice navigation with "next", "previous", "confirm", "back" commands

### 5. Privacy-First Architecture

**Data Flow**:
- Form images sent to backend, processed, deleted immediately after extraction
- Audio recordings sent to STT service, transcribed, deleted immediately
- No session data persisted to database
- All session state held in memory with TTL-based cleanup

**No Analytics**:
- No tracking pixels or third-party analytics
- Error logging captures only error type/message, never user data
- Frontend displays visible privacy notice on launch

### 6. PDF Generation Strategy

**For Pre-Mapped Forms**:
- Use pdf-lib to load template PDF
- Map extracted field IDs to PDF form field names
- Fill using `form.getTextField(name).setText(value)`
- Generate filled PDF buffer, send to client

**For Unknown Forms (Fallback)**:
- Generate plain text summary in target language
- Format: "Field Name: User Answer" for each field
- Include "Required Documents" section listing all needed supporting docs
- Return as downloadable .txt file

### 7. Error Handling & Fallback Strategy

**Vision Extraction Failure**:
- Suggest retaking photo with better lighting/angle
- Provide manual form selection option (for known forms)

**Simplification Failure**:
- Fall back to raw form text
- Display warning that instructions are in original bureaucratic language

**TTS Service Unavailable**:
- Display text on screen as visual fallback
- Continue allowing text input as alternative to voice

**STT Transcription Failure**:
- Prompt user to repeat (up to 3 attempts)
- Fall back to manual text input if repeated failures

**Network Loss**:
- Preserve session state in localStorage
- Display clear "reconnecting" message
- Resume from current field when connection restored

## Build Order & Milestones

### Phase 1: Vision Extraction (Highest Priority)
- [ ] Set up backend API proxy for LLM calls
- [ ] Implement vision extraction endpoint with structured prompt
- [ ] Create Field Schema validation
- [ ] Test against 3-4 real forms (disability cert, ration card, etc.)
- [ ] Iterate on prompt until extraction is reliable for skewed/handwritten forms

**Success Criteria**: 90%+ accurate field extraction on test forms

### Phase 2: Simplification & Translation
- [ ] Implement simplification endpoint
- [ ] Implement translation endpoint
- [ ] Test simplified output readability (5th-grade level)
- [ ] Validate translations for Tamil, English, Hindi

**Success Criteria**: Simplified instructions understandable by test users

### Phase 3: Audio Interface
- [ ] Integrate Google Cloud TTS (Tamil, English, Hindi)
- [ ] Integrate Whisper API for STT
- [ ] Build voice interface state machine
- [ ] Implement confirmation loop
- [ ] Add field navigation (previous/next)
- [ ] Accessibility audit with screen reader testing

**Success Criteria**: Complete voice-only workflow functional without visual reliance

### Phase 4: Output Generation
- [ ] Implement fallback summary generator
- [ ] Create 2-3 pre-mapped form templates (disability cert, ration card)
- [ ] Build PDF filling logic with pdf-lib
- [ ] Add output preview screen
- [ ] Implement download functionality

**Success Criteria**: Both PDF and fallback summary generation working

### Phase 5: PWA & Polish
- [ ] Add web app manifest
- [ ] Implement service worker for PWA installation
- [ ] Add network status detection
- [ ] Implement privacy notice display
- [ ] Add error handling and user feedback
- [ ] End-to-end testing with real forms

**Success Criteria**: Full workflow from photo to filled output completed successfully

## Security Considerations

1. **API Key Protection**: All external service API keys stored as environment variables, never in client code
2. **Input Validation**: File size limits (10MB), file type validation, rate limiting on all endpoints
3. **CORS Configuration**: Restrict API access to known frontend origins
4. **Data Cleanup**: Automatic session cleanup after 1 hour of inactivity
5. **No Data Retention**: Explicit deletion of images and audio after processing
6. **HTTPS Only**: Enforce secure connections for all API calls

## Performance Considerations

1. **Image Compression**: Resize uploaded images to max 2048px width before sending to LLM
2. **Audio Streaming**: Stream TTS audio instead of loading entire file
3. **Lazy Loading**: Load components on-demand as user progresses through stages
4. **Caching**: Cache language selection and form templates on backend
5. **Timeout Handling**: 30-second timeout on LLM calls, retry with exponential backoff

## Testing Strategy

1. **Unit Tests**: Test Field Schema validation, simplification logic, PDF mapping
2. **Integration Tests**: Test API endpoints with mock external services
3. **Accessibility Tests**: Automated testing with axe-core, manual screen reader testing
4. **Real Form Tests**: Validate against 3-4 actual government forms
5. **User Testing**: Test with target users (blind, low-literacy) for usability feedback

## Deployment Considerations

- **Target Environment**: Common Service Centre (CSC) or document camps with reliable internet
- **Browser Support**: Modern mobile browsers (Chrome, Safari, Firefox) with Web Speech API support
- **Hosting**: Frontend on CDN (Vercel/Netlify), backend on cloud platform (AWS/GCP/Azure)
- **Monitoring**: Error logging to backend, no user data included in logs
- **Scaling**: Rate limiting and request queuing to manage LLM API costs
