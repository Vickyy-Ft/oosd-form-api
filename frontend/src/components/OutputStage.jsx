import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppContext } from '../contexts/AppContext';
import { generateOutput, API_BASE_URL } from '../utils/api';
import './OutputStage.css';

const CONTENT = {
  english: {
    title: 'Form Completed Successfully! 🎉',
    generating: 'Preparing your filled form output...',
    download: 'Download PDF Form',
    scanQr: 'Scan QR Code to Download on Mobile',
    requiredDocs: 'Required Supporting Documents to Attach',
    startNew: 'Fill Another Form',
    printSummary: 'Print Form Summary',
    error: 'Error generating form output'
  },
  tamil: {
    title: 'படிவம் வெற்றிகரமாக முடிந்தது! 🎉',
    generating: 'உங்கள் நிரப்பிய படிவத்தை தயார் செய்கிறது...',
    download: 'PDF படிவத்தைப் பதிவிறக்கவும்',
    scanQr: 'மொபைலில் பதிவிறக்க QR குறியீட்டை ஸ்கேன் செய்யவும்',
    requiredDocs: 'இணைக்க வேண்டிய தேவையான ஆவணங்கள்',
    startNew: 'மற்றொரு படிவத்தை நிரப்பு',
    printSummary: 'படிவ சுருக்கத்தை அச்சிடு',
    error: 'வெளியீட்டை உருவாக்குவதில் பிழை'
  },
  hindi: {
    title: 'फॉर्म सफलतापूर्वक पूरा हुआ! 🎉',
    generating: 'आपका भरा हुआ फॉर्म तैयार किया जा रहा है...',
    download: 'PDF फॉर्म डाउनलोड करें',
    scanQr: 'मोबाइल पर डाउनलोड करने के लिए QR कोड स्कैन करें',
    requiredDocs: 'संलग्न करने के लिए आवश्यक दस्तावेज',
    startNew: 'दूसरा फॉर्म भरें',
    printSummary: 'फॉर्म सारांश प्रिंट करें',
    error: 'आउटपुट जेनरेट करने में त्रुटि'
  }
};

const OutputStage = () => {
  const { language, formData, resetApp } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [outputType, setOutputType] = useState(null);
  const [error, setError] = useState(null);

  const content = CONTENT[language] || CONTENT.english;

  useEffect(() => {
    const generateFormOutput = async () => {
      try {
        const response = await generateOutput(formData, language);

        if (response.success) {
          setDownloadUrl(response.download_url);
          setOutputType(response.output_type);
        } else {
          throw new Error(response.error || 'Failed to generate output');
        }
      } catch (err) {
        console.error('Output generation error:', err);
        setError(err.message || content.error);
      } finally {
        setIsGenerating(false);
      }
    };

    if (formData) {
      generateFormOutput();
    }
  }, [formData, language, content.error]);

  // Collect required documents
  const requiredDocuments = new Set();
  if (formData?.fields) {
    formData.fields.forEach(field => {
      if (field.required_documents?.length > 0) {
        field.required_documents.forEach(doc => requiredDocuments.add(doc));
      }
    });
  }

  const handlePrint = () => {
    window.print();
  };

  const fullDownloadUrl = downloadUrl 
    ? (downloadUrl.startsWith('/api') ? downloadUrl.replace('/api', API_BASE_URL) : downloadUrl)
    : window.location.href;

  if (isGenerating) {
    return (
      <div className="output-stage">
        <div className="glass-panel text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '4rem 2rem' }}>
          <div className="spinner-glow"></div>
          <p className="text-muted">{content.generating}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="output-stage">
      <div className="glass-panel text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div className="success-badge">✓</div>
        <h2 className="heading-primary">{content.title}</h2>

        {error ? (
          <div className="alert-error" role="alert">
            {error}
          </div>
        ) : (
          <>
            {/* Download Action Row */}
            <div className="download-actions">
              {downloadUrl && (
                <a
                  className="btn-download-pdf"
                  href={fullDownloadUrl}
                  download="filled_form.pdf"
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span className="icon">⬇️</span>
                  <span>{content.download}</span>
                </a>
              )}

              <button
                className="btn-print"
                onClick={handlePrint}
              >
                <span className="icon">🖨️</span>
                <span>{content.printSummary}</span>
              </button>
            </div>

            {/* Live Mobile QR Code */}
            {downloadUrl && (
              <div className="qr-container">
                <p className="qr-label">{content.scanQr}</p>
                <div className="qr-box">
                  <QRCodeSVG value={fullDownloadUrl} size={160} level="M" />
                </div>
              </div>
            )}

            {/* Filled Answers Summary */}
            <div className="summary-section">
              <h3 className="section-title">Form Data Summary</h3>
              <div className="summary-grid">
                {formData?.fields
                  ?.filter(f => f.answer)
                  .map((field, idx) => (
                    <div key={idx} className="summary-item">
                      <div className="summary-key">{field.simplified_label || field.raw_label}</div>
                      <div className="summary-val">{field.answer}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Required Documents List */}
            {requiredDocuments.size > 0 && (
              <div className="docs-section">
                <h3 className="section-title">📄 {content.requiredDocs}</h3>
                <ul className="docs-list">
                  {Array.from(requiredDocuments).map((doc, idx) => (
                    <li key={idx} className="doc-item">
                      <span className="doc-check">✓</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Start New Form Button */}
        <button
          className="btn-start-over"
          onClick={resetApp}
        >
          <span>+ {content.startNew}</span>
        </button>
      </div>
    </div>
  );
};

export default OutputStage;
