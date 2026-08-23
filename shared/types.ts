/**
 * Shared TypeScript types for the Accessible Form Assistant
 * Used by both frontend and backend
 */

/**
 * Type of input expected for a form field
 */
export type FieldType = 'text' | 'date' | 'number' | 'choice' | 'signature';

/**
 * A single field on a government form
 */
export interface FormField {
  /** Unique identifier for this field */
  field_id: string;
  
  /** Original field label from form image */
  raw_label: string;
  
  /** Type of input expected */
  field_type: FieldType;
  
  /** Original instructions text */
  raw_instructions: string;
  
  /** List of supporting documents needed for this field */
  required_documents: string[];
  
  /** 5th-grade reading level label */
  simplified_label: string;
  
  /** 5th-grade reading level instructions */
  simplified_instructions: string;
  
  /** User's provided answer */
  answer: string | null;
  
  /** Whether user confirmed this answer */
  confirmed: boolean;
  
  /** Available options for 'choice' type fields */
  choices?: string[];
}

/**
 * Complete form data with all extracted fields
 */
export interface FormData {
  /** Unique identifier for this form session */
  form_id: string;
  
  /** Array of all fields in the form */
  fields: FormField[];
}

/**
 * Session state for frontend
 */
export interface SessionState {
  sessionId: string;
  language: 'tamil' | 'english' | 'hindi';
  formData: FormData | null;
  currentFieldIndex: number;
  stage: 'capture' | 'extracting' | 'simplifying' | 'voice' | 'output';
  uploadedImage: File | null;
}

/**
 * Pre-mapped form template configuration
 */
export interface FormTemplate {
  template_id: string;
  form_name: string;
  pdf_path: string;
  field_mappings: FieldMapping[];
}

/**
 * Mapping between extracted field and PDF field
 */
export interface FieldMapping {
  field_id: string;
  pdf_field_name: string;
  page_number: number;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * API response types
 */
export interface ExtractResponse {
  success: boolean;
  formData?: FormData;
  error?: string;
}

export interface SimplifyTranslateResponse {
  success: boolean;
  formData?: FormData;
  error?: string;
}

export interface GenerateOutputResponse {
  success: boolean;
  output_type: 'pdf' | 'summary';
  download_url: string;
  error?: string;
}

export interface TranscriptionResponse {
  success: boolean;
  transcription?: string;
  confidence?: number;
  error?: string;
}
