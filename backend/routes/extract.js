import express from 'express';
import multer from 'multer';
import { extractFieldsWithVision } from '../utils/llm.js';

const router = express.Router();

// Use memoryStorage — no disk writes, faster, safer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: (process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'));
    }
  }
});

/**
 * POST /api/extract
 * Extract form fields from uploaded image using Gemini vision
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    // Pass buffer + mimeType directly — no disk I/O
    const formData = await extractFieldsWithVision({
      imageBuffer: req.file.buffer,
      mimeType: req.file.mimetype
    });

    res.json({ success: true, formData });

  } catch (error) {
    console.error('Extraction error:', error.message);
    if (error.response) {
      console.error('API error:', error.response.status, error.response.data);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract form fields',
      details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
    });
  }
});

export default router;
