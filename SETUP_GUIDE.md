# Setup Guide - Accessible Form Assistant

This guide will walk you through setting up the Accessible Form Assistant from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [API Keys Setup](#api-keys-setup)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
  
- **npm**: Comes with Node.js
  - Verify installation: `npm --version`

### Required API Keys
1. **OpenAI API Key** (Required)
   - Used for GPT-4o vision extraction and Whisper speech-to-text
   - Sign up at: https://platform.openai.com/signup
   - Get your API key from: https://platform.openai.com/api-keys

2. **Google Cloud TTS API Key** (Optional but recommended)
   - Used for high-quality text-to-speech in multiple languages
   - Sign up at: https://cloud.google.com/
   - Enable Text-to-Speech API
   - Create credentials and download JSON key file

## API Keys Setup

### 1. OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (it will only be shown once!)
4. Save it securely for later use

**Cost Estimate**:
- GPT-4o Vision: ~$0.01 per form extraction
- Whisper API: ~$0.006 per minute of audio

### 2. Google Cloud TTS Setup (Optional)

1. Create a Google Cloud project at https://console.cloud.google.com/
2. Enable the Text-to-Speech API
3. Create a service account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Grant "Text-to-Speech User" role
4. Create and download a JSON key file
5. Save the path to this JSON file for configuration

**Alternative**: The app will fall back to Web Speech API if Google TTS is not configured.

## Installation Steps

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd accessible-form-assistant

# Or simply download and extract the project files
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- express (API server)
- dotenv (environment variables)
- multer (file uploads)
- cors (cross-origin requests)
- helmet (security)
- express-rate-limit (rate limiting)
- axios (HTTP client)
- pdf-lib (PDF generation)
- form-data (multipart forms)

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install:
- react (UI framework)
- react-dom (React DOM renderer)
- axios (HTTP client)
- vite (build tool)
- @vitejs/plugin-react (Vite React plugin)

## Configuration

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and add your API keys:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:5173
   
   # OpenAI API (REQUIRED)
   OPENAI_API_KEY=sk-your-openai-api-key-here
   
   # Google Cloud Text-to-Speech (OPTIONAL)
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
   GOOGLE_CLOUD_PROJECT=your-project-id
   
   # Session Configuration
   SESSION_TIMEOUT_MS=3600000
   MAX_FILE_SIZE_MB=10
   ```

### Frontend Configuration

The frontend is configured through `frontend/vite.config.js` and typically doesn't require changes for local development.

If you need to change the API proxy:
```javascript
// frontend/vite.config.js
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Change if backend runs on different port
        changeOrigin: true
      }
    }
  }
});
```

## Running the Application

### Development Mode

You need two terminal windows/tabs:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm start
```

You should see:
```
🚀 Server running on port 3001
📍 Health check: http://localhost:3001/api/health
🌍 Environment: development
```

**Terminal 2 - Frontend Dev Server:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### Testing the API

Test the backend health check:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-08-22T...",
  "version": "1.0.0"
}
```

## Testing

### Manual Testing Checklist

1. **Language Selection**
   - [ ] Can select English
   - [ ] Can select Tamil
   - [ ] Can select Hindi

2. **Privacy Notice**
   - [ ] Privacy notice displays
   - [ ] Can acknowledge and continue

3. **Form Capture**
   - [ ] Camera capture works (mobile)
   - [ ] File upload works
   - [ ] Shows error for large files (>10MB)
   - [ ] Shows preview of uploaded image

4. **Field Extraction**
   - [ ] Form fields extracted successfully
   - [ ] Shows loading indicator
   - [ ] Handles extraction errors gracefully

5. **Simplification**
   - [ ] Instructions simplified
   - [ ] Translated to selected language

6. **Voice Interface**
   - [ ] TTS reads field instructions
   - [ ] Microphone permission requested
   - [ ] Can record voice answer
   - [ ] Shows transcription
   - [ ] Can confirm or correct answer
   - [ ] Can navigate between fields
   - [ ] Progress bar updates

7. **Output Generation**
   - [ ] PDF or summary generated
   - [ ] Can download output
   - [ ] Required documents listed
   - [ ] Can start new form

8. **Accessibility**
   - [ ] Works with screen reader
   - [ ] All buttons have aria-labels
   - [ ] Touch targets are 48x48px minimum
   - [ ] Keyboard navigation works

### Testing with Sample Forms

Create a test form by printing or photographing a simple government form. Test with:
- Clear, straight photo
- Skewed photo (15 degrees)
- Photo with handwritten fields
- Low-quality photo

## Deployment

### Production Build

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```
   
   This creates optimized files in `frontend/dist/`

2. **Configure backend for production:**
   ```env
   NODE_ENV=production
   FRONTEND_URL=https://your-production-domain.com
   PORT=3001
   ```

3. **Serve the application:**
   - Serve frontend static files from `frontend/dist/`
   - Run backend with `npm start` or use a process manager like PM2

### Recommended Hosting Platforms

**Frontend:**
- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Backend:**
- Heroku
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service

### Environment Variables for Production

Ensure these are set in your production environment:
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.com
OPENAI_API_KEY=your-key
GOOGLE_CLOUD_TTS_API_KEY=your-key
SESSION_TIMEOUT_MS=3600000
MAX_FILE_SIZE_MB=10
```

### Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **API Keys**: Never commit API keys to version control
3. **CORS**: Restrict CORS to your frontend domain only
4. **Rate Limiting**: Keep rate limiting enabled
5. **File Size**: Enforce file size limits
6. **Session Cleanup**: Ensure automatic cleanup works

## Troubleshooting

### Backend Won't Start

**Problem**: `Error: Cannot find module 'express'`
- **Solution**: Run `npm install` in backend directory

**Problem**: `Error: OPENAI_API_KEY not configured`
- **Solution**: Add OpenAI API key to `.env` file

**Problem**: Port 3001 already in use
- **Solution**: Change PORT in `.env` or kill the process using port 3001

### Frontend Won't Start

**Problem**: `Error: Cannot find module 'react'`
- **Solution**: Run `npm install` in frontend directory

**Problem**: API requests fail with CORS error
- **Solution**: Check FRONTEND_URL in backend `.env` matches frontend URL

### Form Extraction Fails

**Problem**: "Failed to extract form fields"
- **Solution**: 
  - Verify OPENAI_API_KEY is correct
  - Check image is clear and not too large
  - Try a different image

### Voice Recording Not Working

**Problem**: Microphone permission denied
- **Solution**: 
  - Grant microphone permission in browser settings
  - Use HTTPS (required for microphone access)
  - Try a different browser

**Problem**: "Could not access microphone"
- **Solution**: 
  - Check if another app is using the microphone
  - Restart the browser
  - Check system microphone settings

### Text-to-Speech Not Working

**Problem**: TTS returns "mock audio"
- **Solution**: This is normal if Google Cloud TTS is not configured. The app will fall back to Web Speech API.

**Problem**: No audio plays
- **Solution**: 
  - Check browser audio isn't muted
  - Try a different browser (Chrome/Safari recommended)
  - Check if Web Speech API is supported

## Performance Optimization

### For Low-End Devices

1. Reduce image size before upload
2. Use Web Speech API instead of Google TTS
3. Process fewer fields at once
4. Increase timeout values

### For Slow Networks

1. Compress images before upload
2. Increase API timeout values in `frontend/src/utils/api.js`:
   ```javascript
   timeout: 120000 // 2 minutes instead of 1
   ```

## Support & Resources

- **Documentation**: See README.md
- **API Documentation**: See design.md
- **Requirements**: See requirements.md
- **Tasks**: See tasks.md

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the error logs in browser console and terminal
3. Verify all API keys are correct
4. Test with a simpler form
5. Try a different browser

## Next Steps

After successful setup:

1. Test with real government forms
2. Add more pre-mapped form templates
3. Customize language translations
4. Deploy to production
5. Gather user feedback

---

**Congratulations!** You've successfully set up the Accessible Form Assistant. Start by testing with a simple form to ensure everything works correctly.
