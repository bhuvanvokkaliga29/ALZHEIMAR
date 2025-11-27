/*
  # Alzheimer's Disease Detection Platform - Database Schema

  ## Overview
  Complete database schema for AI-based Alzheimer's detection system with user management,
  MRI uploads, cognitive test data, predictions, and personalized recommendations.

  ## New Tables
  
  ### 1. `profiles`
  User profile information linked to auth.users
  - `id` (uuid, primary key) - matches auth.users.id
  - `email` (text) - user email
  - `full_name` (text) - user's full name
  - `date_of_birth` (date) - for age calculations
  - `created_at` (timestamptz) - account creation timestamp
  - `updated_at` (timestamptz) - last update timestamp

  ### 2. `mri_uploads`
  Stores MRI scan uploads and metadata
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - links to profiles
  - `file_url` (text) - storage URL for MRI image
  - `file_name` (text) - original filename
  - `file_size` (bigint) - file size in bytes
  - `scan_type` (text) - '2D' or '3D'
  - `upload_date` (timestamptz)
  - `preprocessed` (boolean) - preprocessing status
  - `preprocessed_url` (text, nullable) - URL after preprocessing

  ### 3. `cognitive_tests`
  Cognitive assessment scores
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `mri_upload_id` (uuid, foreign key) - links to specific MRI scan
  - `mmse_score` (decimal) - Mini-Mental State Examination (0-30)
  - `memory_score` (decimal) - Memory test score (0-100)
  - `attention_score` (decimal) - Attention test score (0-100)
  - `reasoning_score` (decimal) - Reasoning test score (0-100)
  - `test_date` (timestamptz)
  - `notes` (text, nullable)

  ### 4. `predictions`
  AI model predictions and results
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `mri_upload_id` (uuid, foreign key)
  - `cognitive_test_id` (uuid, foreign key)
  - `prediction_stage` (text) - 'NC', 'MCI', or 'AD'
  - `confidence_nc` (decimal) - confidence for Normal Cognition
  - `confidence_mci` (decimal) - confidence for MCI
  - `confidence_ad` (decimal) - confidence for Alzheimer's
  - `model_version` (text) - AI model version used
  - `prediction_date` (timestamptz)
  - `processing_time_ms` (integer) - inference time

  ### 5. `recommendations`
  Personalized recommendations based on predictions
  - `id` (uuid, primary key)
  - `prediction_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `stage` (text) - 'NC', 'MCI', or 'AD'
  - `lifestyle_recommendations` (text[]) - lifestyle advice
  - `medical_recommendations` (text[]) - medical suggestions
  - `cognitive_exercises` (text[]) - brain exercises
  - `followup_interval_days` (integer) - recommended follow-up period
  - `created_at` (timestamptz)

  ### 6. `model_metrics`
  Stores model performance metrics
  - `id` (uuid, primary key)
  - `model_version` (text)
  - `accuracy` (decimal)
  - `f1_score` (decimal)
  - `precision_nc` (decimal)
  - `precision_mci` (decimal)
  - `precision_ad` (decimal)
  - `recall_nc` (decimal)
  - `recall_mci` (decimal)
  - `recall_ad` (decimal)
  - `confusion_matrix` (jsonb) - stores confusion matrix data
  - `roc_auc` (decimal)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies enforce authentication and ownership checks
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  date_of_birth date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create mri_uploads table
CREATE TABLE IF NOT EXISTS mri_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  scan_type text NOT NULL DEFAULT '2D',
  upload_date timestamptz DEFAULT now(),
  preprocessed boolean DEFAULT false,
  preprocessed_url text
);

ALTER TABLE mri_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own MRI uploads"
  ON mri_uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MRI uploads"
  ON mri_uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own MRI uploads"
  ON mri_uploads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own MRI uploads"
  ON mri_uploads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create cognitive_tests table
CREATE TABLE IF NOT EXISTS cognitive_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mri_upload_id uuid NOT NULL REFERENCES mri_uploads(id) ON DELETE CASCADE,
  mmse_score decimal(4,2) NOT NULL CHECK (mmse_score >= 0 AND mmse_score <= 30),
  memory_score decimal(5,2) NOT NULL CHECK (memory_score >= 0 AND memory_score <= 100),
  attention_score decimal(5,2) NOT NULL CHECK (attention_score >= 0 AND attention_score <= 100),
  reasoning_score decimal(5,2) NOT NULL CHECK (reasoning_score >= 0 AND reasoning_score <= 100),
  test_date timestamptz DEFAULT now(),
  notes text
);

ALTER TABLE cognitive_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cognitive tests"
  ON cognitive_tests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cognitive tests"
  ON cognitive_tests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cognitive tests"
  ON cognitive_tests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cognitive tests"
  ON cognitive_tests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mri_upload_id uuid NOT NULL REFERENCES mri_uploads(id) ON DELETE CASCADE,
  cognitive_test_id uuid NOT NULL REFERENCES cognitive_tests(id) ON DELETE CASCADE,
  prediction_stage text NOT NULL CHECK (prediction_stage IN ('NC', 'MCI', 'AD')),
  confidence_nc decimal(5,4) NOT NULL CHECK (confidence_nc >= 0 AND confidence_nc <= 1),
  confidence_mci decimal(5,4) NOT NULL CHECK (confidence_mci >= 0 AND confidence_mci <= 1),
  confidence_ad decimal(5,4) NOT NULL CHECK (confidence_ad >= 0 AND confidence_ad <= 1),
  model_version text NOT NULL DEFAULT 'v1.0',
  prediction_date timestamptz DEFAULT now(),
  processing_time_ms integer DEFAULT 0
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own predictions"
  ON predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id uuid NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (stage IN ('NC', 'MCI', 'AD')),
  lifestyle_recommendations text[] NOT NULL DEFAULT '{}',
  medical_recommendations text[] NOT NULL DEFAULT '{}',
  cognitive_exercises text[] NOT NULL DEFAULT '{}',
  followup_interval_days integer NOT NULL DEFAULT 180,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create model_metrics table (public read for all authenticated users)
CREATE TABLE IF NOT EXISTS model_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL,
  accuracy decimal(5,4) NOT NULL,
  f1_score decimal(5,4) NOT NULL,
  precision_nc decimal(5,4) NOT NULL,
  precision_mci decimal(5,4) NOT NULL,
  precision_ad decimal(5,4) NOT NULL,
  recall_nc decimal(5,4) NOT NULL,
  recall_mci decimal(5,4) NOT NULL,
  recall_ad decimal(5,4) NOT NULL,
  confusion_matrix jsonb NOT NULL,
  roc_auc decimal(5,4) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE model_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view model metrics"
  ON model_metrics FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mri_uploads_user_id ON mri_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_tests_user_id ON cognitive_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_tests_mri_id ON cognitive_tests(mri_upload_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_mri_id ON predictions(mri_upload_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_prediction_id ON recommendations(prediction_id);

-- Insert sample model metrics
INSERT INTO model_metrics (
  model_version,
  accuracy,
  f1_score,
  precision_nc,
  precision_mci,
  precision_ad,
  recall_nc,
  recall_mci,
  recall_ad,
  confusion_matrix,
  roc_auc
) VALUES (
  'v1.0',
  0.9245,
  0.9187,
  0.9456,
  0.8923,
  0.9301,
  0.9512,
  0.8845,
  0.9256,
  '{"NC": {"NC": 156, "MCI": 8, "AD": 2}, "MCI": {"NC": 12, "MCI": 142, "AD": 9}, "AD": {"NC": 3, "MCI": 11, "AD": 148}}'::jsonb,
  0.9534
)
ON CONFLICT DO NOTHING;