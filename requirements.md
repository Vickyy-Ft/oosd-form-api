# Requirements Document

## Introduction

The Accessible Form Assistant is a mobile-first web application that enables blind, low-vision, low-literacy, elderly, and cognitively disabled users to fill out government forms through an audio-first, voice-driven interface. Users photograph or upload a paper/PDF form, and the system extracts fields, translates and simplifies instructions, guides users through voice-based completion, and generates a filled output. The system supports Tamil, English, and Hindi languages.

## Glossary

- **Form_Assistant**: The complete web application system
- **Vision_Extractor**: The component that analyzes form images and extracts structured field data
- **Simplifier**: The component that rewrites complex form language into 5th-grade reading level
- **Translator**: The component that converts text into the user's chosen language
- **Audio_Interface**: The component that provides text-to-speech and speech-to-text capabilities
- **Output_Generator**: The component that produces the final filled form or summary
- **User**: A person with visual, literacy, or cognitive accessibility needs
- **Form_Field**: A single input element on a government form requiring user data
- **Session**: A single form-filling interaction from photo capture to output generation
- **Target_Language**: One of Tamil, English, or Hindi
- **Field_Schema**: The structured JSON format containing extracted form field data
- **Confirmation_Loop**: The process of playing back a transcribed answer and requesting user verification
- **Pre_Mapped_Form**: A government form for which the system has a fillable PDF template
- **Fallback_Summary**: A plain-language text document listing all fields and answers when PDF generation is unavailable

## Requirements

### Requirement 1: Form Image Capture

**User Story:** As a User, I want to capture or upload an image of a government form, so that I can begin the form-filling process.

#### Acceptance Criteria

1. THE Form_Assistant SHALL accept photographs captured via the device camera
2. THE Form_Assistant SHALL accept uploaded PDF files
3. THE Form_Assistant SHALL accept uploaded image files in JPEG, PNG, and WebP formats
4. WHEN the User provides a form image or PDF, THE Form_Assistant SHALL validate that the file size is below 10MB
5. IF the file size exceeds 10MB, THEN THE Form_Assistant SHALL display an error message requesting a smaller file
6. WHEN a valid form image is received, THE Form_Assistant SHALL proceed to field extraction

### Requirement 2: Vision-Based Field Extraction

**User Story:** As a User, I want the system to automatically read and understand all fields on my form, so that I do not need to manually identify what information is required.

#### Acceptance Criteria

1. WHEN a form image is provided, THE Vision_Extractor SHALL send the image to a multimodal LLM with a structured extraction prompt
2. THE Vision_Extractor SHALL return a Field_Schema containing field_id, raw_label, field_type, raw_instructions, and required_documents for each detected field
3. THE Vision_Extractor SHALL identify field types as one of: text, date, number, choice, or signature
4. THE Vision_Extractor SHALL extract fields from forms with skewed angles, handwritten text, and inconsistent layouts
5. WHEN the LLM returns a response, THE Vision_Extractor SHALL validate the response against the Field_Schema JSON structure
6. IF the LLM response does not conform to the Field_Schema, THEN THE Vision_Extractor SHALL return an error message indicating extraction failure
7. THE Vision_Extractor SHALL extract required_documents lists for fields that reference supporting documentation
8. THE Vision_Extractor SHALL assign a unique form_id to each processed form image

### Requirement 3: Instruction Simplification and Translation

**User Story:** As a User, I want form instructions rewritten in simple language in my own language, so that I can understand what information is needed without bureaucratic jargon.

#### Acceptance Criteria

1. WHEN the User selects a Target_Language, THE Form_Assistant SHALL store the language preference for the Session
2. WHEN Field_Schema data is available, THE Simplifier SHALL send each raw_label and raw_instructions to an LLM with a simplification prompt requesting 5th-grade reading level output
3. THE Translator SHALL convert simplified text into the User's selected Target_Language
4. THE Simplifier SHALL return simplified_label and simplified_instructions for each Form_Field
5. WHEN simplification completes, THE Form_Assistant SHALL validate that simplified_label and simplified_instructions are present for all fields
6. IF simplification fails for any field, THEN THE Form_Assistant SHALL fall back to the raw_label and raw_instructions for that field
7. THE Simplifier SHALL preserve the semantic meaning of legal and regulatory requirements while simplifying language

### Requirement 4: Audio-First Voice Interface

**User Story:** As a User, I want to hear each form field read aloud and answer by voice, so that I can complete the form without needing to read or type.

#### Acceptance Criteria

1. WHEN the User enters the voice interface, THE Audio_Interface SHALL read the simplified_label and simplified_instructions aloud using text-to-speech
2. THE Audio_Interface SHALL use a cloud-based TTS service with support for Tamil, English, and Hindi
3. WHEN the simplified_instructions have been read, THE Audio_Interface SHALL prompt the User to provide an answer
4. THE Audio_Interface SHALL use speech-to-text to transcribe the User's spoken answer
5. WHEN a transcription is complete, THE Audio_Interface SHALL initiate a Confirmation_Loop by reading back the transcribed answer
6. THE Audio_Interface SHALL prompt the User to confirm or correct the transcribed answer
7. WHEN the User confirms the answer, THE Audio_Interface SHALL mark the field as confirmed and store the answer
8. WHEN the User requests a correction, THE Audio_Interface SHALL re-prompt for a new answer and repeat the Confirmation_Loop
9. THE Audio_Interface SHALL navigate to the next field after confirmation
10. THE Audio_Interface SHALL allow the User to navigate backward to previous fields
11. WHEN all fields are confirmed, THE Audio_Interface SHALL proceed to output generation

### Requirement 5: Screen Reader and Touch Accessibility

**User Story:** As a blind or low-vision User, I want the interface to work fully with TalkBack and VoiceOver screen readers, so that I can complete forms independently without sighted assistance.

#### Acceptance Criteria

1. THE Form_Assistant SHALL provide ARIA labels for all interactive elements
2. THE Form_Assistant SHALL use semantic HTML elements for navigation, buttons, and form controls
3. THE Form_Assistant SHALL provide touch targets of at least 48x48 CSS pixels for all interactive elements
4. THE Form_Assistant SHALL support keyboard navigation for all functionality
5. THE Form_Assistant SHALL announce state changes and navigation updates to screen readers
6. THE Form_Assistant SHALL not require visual confirmation for any step in the voice interface workflow
7. THE Form_Assistant SHALL provide skip navigation links to bypass repetitive content
8. WHEN focus changes, THE Form_Assistant SHALL ensure the focused element is announced by screen readers

### Requirement 6: Filled Form Output Generation

**User Story:** As a User, I want to receive a completed version of my form, so that I can submit it to the appropriate government office.

#### Acceptance Criteria

1. WHEN all fields are confirmed, THE Output_Generator SHALL determine if the form is a Pre_Mapped_Form
2. WHERE the form is a Pre_Mapped_Form, THE Output_Generator SHALL generate a filled PDF using the corresponding template
3. WHERE the form is not a Pre_Mapped_Form, THE Output_Generator SHALL generate a Fallback_Summary as a plain-language text document
4. THE Fallback_Summary SHALL list each field's simplified_label and the User's confirmed answer
5. THE Fallback_Summary SHALL be formatted in the User's Target_Language
6. THE Output_Generator SHALL provide a download link for the generated PDF or Fallback_Summary
7. THE Output_Generator SHALL allow the User to preview the output before downloading
8. THE Output_Generator SHALL include required_documents lists in the output for fields that reference supporting documentation

### Requirement 7: Pre-Mapped Form Templates

**User Story:** As a User filling a disability certificate application or ration card update form, I want to receive a properly filled PDF, so that I can submit an official document to the government office.

#### Acceptance Criteria

1. THE Form_Assistant SHALL maintain templates for disability certificate application forms
2. THE Form_Assistant SHALL maintain templates for ration card update forms
3. WHEN the Vision_Extractor identifies a form as matching a Pre_Mapped_Form template, THE Form_Assistant SHALL map extracted fields to template positions
4. THE Output_Generator SHALL populate the PDF template with confirmed answers in the correct field positions
5. THE Output_Generator SHALL preserve the original form layout and formatting when filling templates

### Requirement 8: Privacy and Data Retention

**User Story:** As a User, I want my sensitive personal information and form data to be protected and not retained after my session, so that my privacy is preserved.

#### Acceptance Criteria

1. THE Form_Assistant SHALL delete all form images immediately after field extraction completes
2. THE Form_Assistant SHALL delete all audio recordings immediately after transcription completes
3. THE Form_Assistant SHALL delete all Session data when the User closes the application or explicitly ends the Session
4. THE Form_Assistant SHALL not send form images, audio, or extracted data to any analytics service
5. THE Form_Assistant SHALL not use User data for any model training or fine-tuning
6. THE Form_Assistant SHALL display a visible privacy notice explaining data handling practices
7. THE Form_Assistant SHALL not retain User data on the backend beyond the duration of the Session

### Requirement 9: Network Connectivity Requirements

**User Story:** As a User, I want to understand when the application requires network connectivity, so that I can plan to use it in locations with internet access.

#### Acceptance Criteria

1. WHEN the Form_Assistant loads, THE Form_Assistant SHALL detect network connectivity status
2. IF network connectivity is unavailable, THEN THE Form_Assistant SHALL display a clear message indicating that internet access is required
3. WHEN network connectivity is lost during a Session, THE Form_Assistant SHALL notify the User and preserve Session state
4. WHEN network connectivity is restored, THE Form_Assistant SHALL allow the User to resume the Session
5. THE Form_Assistant SHALL display network status in the user interface during processing-intensive operations

### Requirement 10: Backend API Security

**User Story:** As a system administrator, I want API keys for LLM, TTS, and STT services to be protected on the backend, so that they cannot be extracted or misused by clients.

#### Acceptance Criteria

1. THE Form_Assistant SHALL route all LLM requests through a backend API proxy
2. THE Form_Assistant SHALL route all TTS requests through a backend API proxy
3. THE Form_Assistant SHALL route all STT requests through a backend API proxy
4. THE Form_Assistant SHALL not embed any API keys in client-side code
5. THE backend API SHALL validate all incoming requests before forwarding to external services
6. THE backend API SHALL enforce rate limiting to prevent abuse

### Requirement 11: Multi-Language Support

**User Story:** As a User, I want to select my preferred language from Tamil, English, or Hindi, so that I can interact with the system in the language I understand best.

#### Acceptance Criteria

1. THE Form_Assistant SHALL provide a language selection interface at the start of each Session
2. THE Form_Assistant SHALL support Tamil as a Target_Language for all text and audio output
3. THE Form_Assistant SHALL support English as a Target_Language for all text and audio output
4. THE Form_Assistant SHALL support Hindi as a Target_Language for all text and audio output
5. WHEN the User selects a Target_Language, THE Form_Assistant SHALL use that language for all TTS output, simplified instructions, and generated output
6. THE Audio_Interface SHALL support speech recognition for Tamil, English, and Hindi

### Requirement 12: Error Handling and User Feedback

**User Story:** As a User, I want clear feedback when something goes wrong, so that I understand what happened and what I can do next.

#### Acceptance Criteria

1. WHEN the Vision_Extractor fails to extract fields, THE Form_Assistant SHALL display an error message suggesting the User retake the photo with better lighting or angle
2. WHEN the Simplifier fails, THE Form_Assistant SHALL fall back to raw form text and notify the User
3. WHEN the Audio_Interface fails to transcribe speech, THE Form_Assistant SHALL prompt the User to repeat their answer
4. WHEN the TTS service is unavailable, THE Form_Assistant SHALL display the text on screen as a fallback
5. WHEN the Output_Generator fails to create a PDF, THE Form_Assistant SHALL generate a Fallback_Summary
6. THE Form_Assistant SHALL log all errors to the backend for monitoring without including User data

### Requirement 13: Progressive Web App Installation

**User Story:** As a User, I want to install the Form Assistant on my mobile device home screen, so that I can access it quickly like a native app.

#### Acceptance Criteria

1. WHERE the browser supports PWA installation, THE Form_Assistant SHALL provide a web app manifest
2. WHERE the browser supports PWA installation, THE Form_Assistant SHALL register a service worker
3. THE Form_Assistant SHALL provide an icon suitable for home screen installation
4. THE Form_Assistant SHALL display a prompt encouraging installation when applicable
5. WHEN installed as a PWA, THE Form_Assistant SHALL open in standalone mode without browser chrome

### Requirement 14: Field Validation and Format Guidance

**User Story:** As a User, I want to know if my answer does not match the expected format for a field, so that I can correct it before submission.

#### Acceptance Criteria

1. WHEN a Form_Field has field_type set to date, THE Audio_Interface SHALL validate that the answer matches a date format
2. WHEN a Form_Field has field_type set to number, THE Audio_Interface SHALL validate that the answer contains only numeric characters
3. WHEN validation fails, THE Audio_Interface SHALL explain the expected format and prompt the User to provide a corrected answer
4. WHEN a Form_Field has field_type set to choice, THE Audio_Interface SHALL read available options and validate that the answer matches one option
5. THE Audio_Interface SHALL provide format examples in the User's Target_Language when prompting for dates, numbers, or other structured data
