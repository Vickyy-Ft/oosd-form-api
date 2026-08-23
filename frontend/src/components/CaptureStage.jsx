import React, { useState, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { extractFormFields } from '../utils/api';
import './CaptureStage.css';

const CONTENT = {
  english: {
    title: 'Capture Your Form',
    subtitle: 'Take a photo or upload an image of your government form',
    takePhoto: 'Take Photo',
    uploadFile: 'Upload File',
    processing: 'Reading and analyzing your form with Vision AI...',
    error: 'Error',
    retry: 'Try Again'
  },
  tamil: {
    title: 'உங்கள் படிவத்தைப் பதிவுசெய்க',
    subtitle: 'உங்கள் அரசு படிவத்தின் புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்',
    takePhoto: 'புகைப்படம் எடு',
    uploadFile: 'கோப்பை பதிவேற்று',
    processing: 'உங்கள் படிவத்தை Vision AI மூலம் படிக்கிறது...',
    error: 'பிழை',
    retry: 'மீண்டும் முயற்சி'
  },
  hindi: {
    title: 'अपना फॉर्म कैप्चर करें',
    subtitle: 'अपने सरकारी फॉर्म की फोटो लें या अपलोड करें',
    takePhoto: 'फोटो लें',
    uploadFile: 'फ़ाइल अपलोड करें',
    processing: 'Vision AI द्वारा आपका फॉर्म पढ़ा जा रहा है...',
    error: 'त्रुटि',
    retry: 'पुनः प्रयास करें'
  }
};

/**
 * Compress client image to max 1280px to save Gemini tokens and bandwidth
 */
async function compressImage(file, maxPx = 1280) {
  if (!file.type.startsWith('image/')) return file; // Skip PDFs

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) {
          height = Math.round((height * maxPx) / width);
          width = maxPx;
        } else {
          width = Math.round((width * maxPx) / height);
          height = maxPx;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

const CaptureStage = () => {
  const { language, setFormData, setStage } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const content = CONTENT[language] || CONTENT.english;

  const handleFileSelect = async (rawFile) => {
    if (!rawFile) return;

    // Validate size
    if (rawFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    // Client-side image compression
    const file = await compressImage(rawFile);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setIsProcessing(true);
    setError(null);

    try {
      const response = await extractFormFields(file);

      if (response.success && response.formData) {
        setFormData(response.formData);
        setStage('simplifying');
      } else {
        throw new Error(response.error || 'Failed to extract form fields');
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to read form image.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="capture-stage">
      <div className="glass-panel text-center">
        <h2 className="heading-primary">{content.title}</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>{content.subtitle}</p>

        {error && (
          <div className="alert-error" role="alert">
            <strong>{content.error}:</strong> {error}
          </div>
        )}

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Form preview" className="form-preview" />
          </div>
        )}

        {isProcessing ? (
          <div className="processing">
            <div className="spinner" aria-label="Loading"></div>
            <p>{content.processing}</p>
          </div>
        ) : (
          <div className="capture-buttons">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <button
              className="capture-button camera"
              onClick={() => cameraInputRef.current?.click()}
            >
              <span className="button-icon">📷</span>
              <span className="button-text">{content.takePhoto}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <button
              className="capture-button upload"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="button-icon">📁</span>
              <span className="button-text">{content.uploadFile}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptureStage;
