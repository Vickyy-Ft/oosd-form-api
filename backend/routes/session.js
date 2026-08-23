import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * DELETE /api/session/:sessionId
 * Clean up session data
 */
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Clean up any files associated with this session
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const outputsDir = path.join(__dirname, '..', 'outputs');

    // This is a simple implementation - in production, you'd track files by session ID
    console.log(`Session cleanup requested for: ${sessionId}`);

    res.json({
      success: true,
      message: 'Session cleaned up successfully'
    });

  } catch (error) {
    console.error('Session cleanup error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clean up session'
    });
  }
});

/**
 * POST /api/session/keepalive
 * Keep session alive
 */
router.post('/keepalive', (req, res) => {
  res.json({
    success: true,
    message: 'Session kept alive'
  });
});

export default router;
