import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { generateFilledPDF, generateTextSummary, generateSimplePDF } from '../utils/pdf-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * POST /api/generate-output
 * Generate filled form output (PDF or text summary)
 */
router.post('/', async (req, res) => {
  try {
    const { formData, language } = req.body;

    if (!formData || !formData.fields) {
      return res.status(400).json({
        success: false,
        error: 'Invalid form data provided'
      });
    }

    const lang = language || 'english';
    if (!['english', 'tamil', 'hindi'].includes(lang)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language'
      });
    }

    // Check if this is a pre-mapped form
    const knownTemplates = ['disability_certificate', 'ration_card'];
    const templateId = knownTemplates.find(t => 
      formData.form_id.toLowerCase().includes(t.replace('_', ' '))
    );

    let outputType = 'summary';
    let filename = '';
    let outputPath = '';

    if (templateId) {
      // Try to generate filled PDF
      const pdfBytes = await generateFilledPDF(formData, templateId);
      
      if (pdfBytes) {
        outputType = 'pdf';
        filename = `${formData.form_id.replace(/\s+/g, '_')}_filled_${Date.now()}.pdf`;
        outputPath = path.join(__dirname, '..', 'outputs', filename);
        await fs.writeFile(outputPath, pdfBytes);
      }
    }

    // If PDF generation failed or not available, generate text summary or simple PDF
    if (outputType === 'summary') {
      // Try to generate a simple PDF
      try {
        const pdfBytes = await generateSimplePDF(formData, lang);
        outputType = 'pdf';
        filename = `${formData.form_id.replace(/\s+/g, '_')}_summary_${Date.now()}.pdf`;
        outputPath = path.join(__dirname, '..', 'outputs', filename);
        await fs.writeFile(outputPath, pdfBytes);
      } catch (pdfError) {
        // Fall back to text summary
        const textSummary = await generateTextSummary(formData, lang);
        filename = `${formData.form_id.replace(/\s+/g, '_')}_summary_${Date.now()}.txt`;
        outputPath = path.join(__dirname, '..', 'outputs', filename);
        await fs.writeFile(outputPath, textSummary, 'utf-8');
      }
    }

    // Schedule file deletion after 1 hour
    setTimeout(async () => {
      try {
        await fs.unlink(outputPath);
        console.log(`Deleted output file: ${filename}`);
      } catch (err) {
        console.error(`Failed to delete output file: ${filename}`, err);
      }
    }, 3600000); // 1 hour

    res.json({
      success: true,
      output_type: outputType,
      download_url: `/api/downloads/${filename}`,
      filename
    });

  } catch (error) {
    console.error('Output generation error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate output'
    });
  }
});

export default router;
