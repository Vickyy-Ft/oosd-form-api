# Accessible Form Assistant

A mobile-first web application that helps blind, low-vision, low-literacy, elderly, and cognitively disabled users fill out government forms through an audio-first, voice-driven interface.

## 🎯 Features

- **Voice-First Interface**: Complete forms entirely by voice with audio feedback
- **Multi-Language Support**: Tamil, English, and Hindi
- **Automatic Form Reading**: AI-powered vision extraction reads form fields
- **Simplified Instructions**: Complex bureaucratic language rewritten at 5th-grade level
- **Full Accessibility**: Screen reader compatible (TalkBack/VoiceOver)
- **Privacy-First**: All data deleted immediately after use
- **PDF Generation**: Auto-fill supported government forms

## 🏗️ Architecture

```
accessible-form-assistant/
├── backend/              # Node.js/Express API server
│   ├── routes/          # API endpoints
│   ├── utils/           # LLM, TTS, STT, PDF utilities
│   ├── uploads/         # Temporary file storage
│   ├── outputs/         # Generated files
│   └── templates/       # Pre-mapped form templates
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   └── utils/       # API client utilities
│   └── public/          # Static assets
└── shared/              # Shared TypeScript types

```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key (for GPT-4o vision and Whisper)
- Optional: Google Cloud TTS API key (for better text-to-speech)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd accessible-form-assistant
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cd ../backend
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_CLOUD_TTS_API_KEY=your_google_tts_key (optional)
   ```

### Running the Application

1. **Start the backend server** (in `backend/` directory):
   ```bash
   npm start
   ```
   Server will run on `http://localhost:3001`

2. **Start the frontend dev server** (in `frontend/` directory):
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## 📱 Usage Flow

1. **Select Language**: Choose Tamil, English, or Hindi
2. **Review Privacy Notice**: Understand data handling practices
3. **Capture Form**: Take a photo or upload an image of your government form
4. **Voice Interaction**: Answer each field by voice with audio guidance
5. **Confirm Answers**: Review and confirm voice transcriptions
6. **Download Output**: Get a filled PDF or text summary

## 🔧 API Endpoints

### Backend API

- `POST /api/extract` - Extract form fields from image
- `POST /api/simplify-translate` - Simplify and translate field instructions
- `POST /api/tts` - Convert text to speech
- `POST /api/stt` - Convert speech to text
- `POST /api/generate-output` - Generate filled PDF or summary
- `DELETE /api/session/:sessionId` - Clean up session data

## 🎨 Technology Stack

### Frontend
- React 18
- Vite (build tool)
- CSS Modules
- Axios (HTTP client)
- Web Speech API (fallback STT)
- MediaRecorder API (audio recording)

### Backend
- Node.js + Express
- OpenAI GPT-4o (vision extraction)
- OpenAI Whisper (speech-to-text)
- Google Cloud TTS (text-to-speech)
- pdf-lib (PDF generation)
- Multer (file uploads)

## ♿ Accessibility Features

- **WCAG 2.1 AA Compliant**: High contrast, proper color ratios
- **Screen Reader Support**: Full TalkBack and VoiceOver compatibility
- **Keyboard Navigation**: Complete keyboard accessibility
- **Touch Targets**: Minimum 48x48px touch targets
- **Semantic HTML**: Proper heading structure and ARIA labels
- **Focus Management**: Clear focus indicators and logical tab order

## 🔒 Privacy & Security

- **No Data Retention**: All images and audio deleted immediately after processing
- **No Analytics**: No tracking or usage analytics
- **No Training Data**: User data never used for model training
- **Secure API Keys**: All API keys stored server-side only
- **Rate Limiting**: Protection against abuse
- **HTTPS Required**: Secure connections enforced in production

## 🌐 Supported Government Forms

### Pre-Mapped Forms (PDF Generation)
- Disability Certificate Application
- Ration Card Update Form

### All Other Forms
- Fallback to text summary generation
- Can be submitted manually at government offices

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Build output will be in frontend/dist
```

### Adding New Form Templates

1. Place blank PDF template in `backend/templates/`
2. Create mapping configuration:
   ```json
   {
     "template_id": "form_name",
     "pdf_path": "./templates/form_name.pdf",
     "field_mappings": [
       {
         "field_id": "extracted_field_name",
         "pdf_field_name": "PDF_FIELD_NAME"
       }
     ]
   }
   ```
3. Update `backend/routes/output.js` to recognize the new template

## 🐛 Troubleshooting

### Vision Extraction Fails
- Ensure image is clear and well-lit
- Check that form is not skewed more than 15 degrees
- Verify OPENAI_API_KEY is configured correctly

### Voice Recording Not Working
- Grant microphone permissions in browser
- Check that device has a working microphone
- Try a different browser (Chrome/Safari recommended)

### TTS Not Working
- Check internet connection
- Verify Google Cloud TTS API key (if configured)
- Falls back to Web Speech API if server TTS unavailable

## 📝 Configuration

### Environment Variables

**Backend** (`.env`):
```
PORT=3001
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=your_key
GOOGLE_CLOUD_TTS_API_KEY=your_key (optional)
SESSION_TIMEOUT_MS=3600000
MAX_FILE_SIZE_MB=10
```

**Frontend** (vite.config.js):
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Target Users

This application is specifically designed for:

- **Blind and low-vision users**: Complete screen reader compatibility
- **Low-literacy users**: Simplified language at 5th-grade reading level
- **Elderly users**: Large touch targets and clear audio guidance
- **Cognitively disabled users**: Step-by-step voice guidance

## 🌟 Acknowledgments

- Built with accessibility-first design principles
- Inspired by the need for inclusive government services
- Designed for Common Service Centre (CSC) deployment

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting section

## 🗺️ Roadmap

- [ ] Add more pre-mapped government forms
- [ ] Support additional Indian languages
- [ ] Offline mode for form completion (where possible)
- [ ] Voice command navigation
- [ ] Multi-page form support
- [ ] Form progress saving

---

**Note**: This application requires internet connectivity for all operations. It is designed for use in locations with reliable internet access, such as Common Service Centres or document assistance camps.
