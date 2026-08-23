import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { speechToText } from '../utils/stt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for audio upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB for audio
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

/**
 * POST /api/stt
 * Convert speech to text
 */
router.post('/', upload.single('audio'), async (req, res) => {
  let audioFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    audioFilePath = req.file.path;
    const language = req.body.language || 'english';

    if (!['english', 'tamil', 'hindi'].includes(language)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language. Must be: english, tamil, or hindi'
      });
    }

    // Transcribe the audio
    const result = await speechToText(audioFilePath, language);

    // Delete the audio file immediately after transcription
    await fs.unlink(audioFilePath);
    audioFilePath = null;

    res.json({
      success: true,
      transcription: result.transcription,
      confidence: result.confidence
    });

  } catch (error) {
    console.error('STT error:', error);

    // Clean up audio file on error
    if (audioFilePath) {
      try {
        await fs.unlink(audioFilePath);
      } catch (unlinkError) {
        console.error('Failed to delete audio file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transcribe audio'
    });
  }
});

export default router;
