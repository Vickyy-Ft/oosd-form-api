import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a filled PDF from a template (for pre-mapped forms)
 */
export async function generateFilledPDF(formData, templateId) {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateId}.pdf`);
  
  try {
    // Check if template exists
    await fs.access(templatePath);
    
    // Load the PDF template
    const existingPdfBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Get the form from the PDF
    const form = pdfDoc.getForm();
    
    // Fill in the fields
    for (const field of formData.fields) {
      if (field.answer && field.confirmed) {
        try {
          const pdfField = form.getTextField(field.field_id);
          pdfField.setText(field.answer);
        } catch (err) {
          console.warn(`Could not fill field ${field.field_id}:`, err.message);
        }
      }
    }
    
    // Flatten the form to make it read-only
    form.flatten();
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
    
  } catch (error) {
    // If template doesn't exist or filling fails, return null
    console.error('PDF generation error:', error.message);
    return null;
  }
}

/**
 * Generate a plain text summary (fallback for non-mapped forms)
 */
export async function generateTextSummary(formData, language) {
  const languageHeaders = {
    english: 'Filled Form Summary',
    tamil: 'பூர்த்தி செய்யப்பட்ட படிவம்',
    hindi: 'भरा हुआ फॉर्म सारांश'
  };

  const requiredDocsHeader = {
    english: 'Required Documents',
    tamil: 'தேவையான ஆவணங்கள்',
    hindi: 'आवश्यक दस्तावेज़'
  };

  const header = languageHeaders[language] || languageHeaders.english;
  const docsHeader = requiredDocsHeader[language] || requiredDocsHeader.english;
  
  let summary = `${header}\n`;
  summary += `${'='.repeat(header.length)}\n\n`;
  summary += `Form ID: ${formData.form_id}\n`;
  summary += `Date: ${new Date().toLocaleDateString()}\n\n`;
  
  // Add all fields and answers
  for (const field of formData.fields) {
    if (field.answer && field.confirmed) {
      summary += `${field.simplified_label}:\n`;
      summary += `  ${field.answer}\n\n`;
    }
  }
  
  // Add required documents section
  const allRequiredDocs = new Set();
  for (const field of formData.fields) {
    if (field.required_documents && field.required_documents.length > 0) {
      field.required_documents.forEach(doc => allRequiredDocs.add(doc));
    }
  }
  
  if (allRequiredDocs.size > 0) {
    summary += `\n${docsHeader}:\n`;
    summary += `${'-'.repeat(docsHeader.length)}\n`;
    allRequiredDocs.forEach(doc => {
      summary += `• ${doc}\n`;
    });
  }
  
  return summary;
}

/**
 * Create a simple PDF from text (when no template is available)
 */
export async function generateSimplePDF(formData, language) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    const margin = 50;
    let yPosition = height - margin;
    
    const languageHeaders = {
      english: 'Filled Form Summary',
      tamil: 'Filled Form Summary', // Would need proper Tamil font
      hindi: 'Filled Form Summary'  // Would need proper Hindi font
    };
    
    // Title
    const title = languageHeaders[language] || languageHeaders.english;
    page.drawText(title, {
      x: margin,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    yPosition -= 40;
    
    // Form ID and Date
    page.drawText(`Form ID: ${formData.form_id}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font
    });
    yPosition -= 20;
    
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font
    });
    yPosition -= 30;
    
    // Fields and answers
    for (const field of formData.fields) {
      if (field.answer && field.confirmed) {
        // Check if we need a new page
        if (yPosition < margin + 40) {
          const newPage = pdfDoc.addPage([595, 842]);
          yPosition = height - margin;
        }
        
        // Field label
        const label = field.simplified_label || field.raw_label;
        page.drawText(label, {
          x: margin,
          y: yPosition,
          size: 11,
          font: boldFont
        });
        yPosition -= 18;
        
        // Field answer
        page.drawText(field.answer, {
          x: margin + 10,
          y: yPosition,
          size: 10,
          font: font
        });
        yPosition -= 25;
      }
    }
    
    // Required documents
    const allRequiredDocs = new Set();
    for (const field of formData.fields) {
      if (field.required_documents && field.required_documents.length > 0) {
        field.required_documents.forEach(doc => allRequiredDocs.add(doc));
      }
    }
    
    if (allRequiredDocs.size > 0) {
      yPosition -= 20;
      
      if (yPosition < margin + 40) {
        const newPage = pdfDoc.addPage([595, 842]);
        yPosition = height - margin;
      }
      
      page.drawText('Required Documents:', {
        x: margin,
        y: yPosition,
        size: 12,
        font: boldFont
      });
      yPosition -= 20;
      
      allRequiredDocs.forEach(doc => {
        if (yPosition < margin + 20) {
          const newPage = pdfDoc.addPage([595, 842]);
          yPosition = height - margin;
        }
        
        page.drawText(`• ${doc}`, {
          x: margin + 10,
          y: yPosition,
          size: 10,
          font: font
        });
        yPosition -= 18;
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
    
  } catch (error) {
    console.error('Simple PDF generation error:', error.message);
    throw error;
  }
}
