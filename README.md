# Accessible Form Assistant 🎙️📝
**Empowering citizens to fill complex government forms independently using Voice and AI Vision.**

---

## 🎯 The Problem
In India, millions of citizens struggle to fill out essential government forms (Ration Cards, Aadhaar Updates, Subsidies) due to language barriers, illiteracy, or complex bureaucratic jargon. This often forces them to rely on paid intermediaries or face delays in receiving critical public services.

## 💡 Our Solution
The **Accessible Form Assistant** is a mobile-first, voice-guided web application that bridges this gap. A user simply takes a photo of any blank government form. Our system uses advanced AI Vision to extract the fields, translates complex bureaucratic terms into simple language, and verbally guides the user to answer each question using their native voice (Tamil, Hindi, or English).

### ✨ Key Features
- **📸 Smart Vision Extraction:** Instantly digitizes physical forms using Google Gemini 3.5 Flash Vision.
- **🗣️ Multilingual Voice Guidance:** Uses Sarvam AI (Indic TTS/STT) to naturally speak questions and transcribe answers in English, Tamil, and Hindi.
- **🧠 Bureaucratic Simplification:** Leverages Groq's Llama models to translate complex terms (e.g., "Domicile Status" ➡️ "Which state do you live in?").
- **🛡️ Privacy First Architecture:** Processes all images and audio in high-speed RAM buffers (`multer.memoryStorage()`). Zero data is saved to disk; sessions are completely wiped upon exit.
- **📱 Instant Mobile Handoff:** Generates a live QR code upon completion, allowing citizens to download the filled PDF directly to their mobile phones at a kiosk.
- **🎨 Premium UI/UX:** Built with a stunning dark-mode glassmorphism design system to provide a world-class, accessible, and intuitive user experience.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Styling:** Custom CSS (Glassmorphism, CSS Animations, Mobile-Responsive)
- **Audio Integration:** Web MediaDevices API + Base64 Audio Buffering
- **State Management:** React Context API + `sessionStorage` (Resilience against page refreshes)

### Backend
- **Server:** Node.js + Express.js
- **File Handling:** Multer (Memory Storage for zero-disk footprint)
- **AI Integrations:**
  - **Google Gemini API**: High-fidelity optical character recognition & field mapping.
  - **Groq API**: Lightning-fast parallel processing for field simplification and voice answer normalization (e.g., converts spoken "twenty third august" to `23/08/1990`).
  - **Sarvam AI API**: State-of-the-art Indic STT (`saarika:v2.5`) and TTS (`bulbul:v2`) for code-mixed Indian languages.

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- API Keys for Google Gemini, Groq, and Sarvam AI.

### 1. Clone the Repository
```bash
git clone https://github.com/Vickyy-Ft/oosd-form-api.git
cd oosd-form-api
```

### 2. Configure Environment Variables
Navigate to the `backend` directory and create a `.env` file:
```env
PORT=3001
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
SARVAM_API_KEY=your_sarvam_api_key_here
```

### 3. Install & Run
You can install and run the entire stack concurrently using the root configuration:

```bash
# Install all dependencies (Frontend & Backend)
npm run install:all

# Start the application
npm start
```
*The frontend will be available at `http://localhost:5173` and the backend will run on `http://localhost:3001`.*

---

## 🔒 Security & Privacy (Hackathon Judging Criteria)
We took extreme care to ensure citizen data is protected:
1. **Zero-Disk Write:** The backend uses memory buffers. Uploaded ID cards and forms never touch a physical hard drive.
2. **Auto-Purge:** The React state is wiped immediately after the PDF is generated.
3. **Client-Side Image Compression:** High-res photos are compressed via HTML5 Canvas on the client's phone *before* being transmitted to the server, reducing bandwidth and securing payloads.

---

## 🤝 Contributing
Built with ❤️ for digital inclusion. Feel free to open issues or submit pull requests.

## 📄 License
This project is licensed under the MIT License.
