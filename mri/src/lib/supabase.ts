import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
};

export type MRIUpload = {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  scan_type: '2D' | '3D';
  upload_date: string;
  preprocessed: boolean;
  preprocessed_url: string | null;
};

export type CognitiveTest = {
  id: string;
  user_id: string;
  mri_upload_id: string;
  mmse_score: number;
  memory_score: number;
  attention_score: number;
  reasoning_score: number;
  test_date: string;
  notes: string | null;
};

export type Prediction = {
  id: string;
  user_id: string;
  mri_upload_id: string;
  cognitive_test_id: string;
  prediction_stage: 'NC' | 'MCI' | 'AD';
  confidence_nc: number;
  confidence_mci: number;
  confidence_ad: number;
  model_version: string;
  prediction_date: string;
  processing_time_ms: number;
};

export type Recommendation = {
  id: string;
  prediction_id: string;
  user_id: string;
  stage: 'NC' | 'MCI' | 'AD';
  lifestyle_recommendations: string[];
  medical_recommendations: string[];
  cognitive_exercises: string[];
  followup_interval_days: number;
  created_at: string;
};

export type ModelMetrics = {
  id: string;
  model_version: string;
  accuracy: number;
  f1_score: number;
  precision_nc: number;
  precision_mci: number;
  precision_ad: number;
  recall_nc: number;
  recall_mci: number;
  recall_ad: number;
  confusion_matrix: {
    NC: { NC: number; MCI: number; AD: number };
    MCI: { NC: number; MCI: number; AD: number };
    AD: { NC: number; MCI: number; AD: number };
  };
  roc_auc: number;
  created_at: string;
};
