import React, { useState } from 'react';
import { Upload, FileImage, Brain, Activity, Eye, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type UploadStepProps = {
  onComplete: (uploadId: string, cognitiveTestId: string) => void;
};

export const UploadStep: React.FC<UploadStepProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [mriFile, setMriFile] = useState<File | null>(null);
  const [mriPreview, setMriPreview] = useState<string>('');
  const [scanType, setScanType] = useState<'2D' | '3D'>('2D');

  const [mmseScore, setMmseScore] = useState('');
  const [memoryScore, setMemoryScore] = useState('');
  const [attentionScore, setAttentionScore] = useState('');
  const [reasoningScore, setReasoningScore] = useState('');
  const [notes, setNotes] = useState('');

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleMRIFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMriFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setMriPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mriFile) return;

    setUploading(true);
    setError('');

    try {
      const fileExt = mriFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `mri-scans/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('mri-uploads')
        .upload(filePath, mriFile);

      if (uploadError) {
        if (uploadError.message.includes('not found')) {
          const { error: bucketError } = await supabase.storage.createBucket('mri-uploads', {
            public: false,
          });

          if (!bucketError) {
            const { error: retryError } = await supabase.storage
              .from('mri-uploads')
              .upload(filePath, mriFile);
            if (retryError) throw retryError;
          }
        } else {
          throw uploadError;
        }
      }

      const { data: { publicUrl } } = supabase.storage
        .from('mri-uploads')
        .getPublicUrl(filePath);

      const { data: mriData, error: mriError } = await supabase
        .from('mri_uploads')
        .insert({
          user_id: user.id,
          file_url: publicUrl,
          file_name: mriFile.name,
          file_size: mriFile.size,
          scan_type: scanType,
          preprocessed: false,
        })
        .select()
        .single();

      if (mriError) throw mriError;

      const { data: cognitiveData, error: cognitiveError } = await supabase
        .from('cognitive_tests')
        .insert({
          user_id: user.id,
          mri_upload_id: mriData.id,
          mmse_score: parseFloat(mmseScore),
          memory_score: parseFloat(memoryScore),
          attention_score: parseFloat(attentionScore),
          reasoning_score: parseFloat(reasoningScore),
          notes: notes || null,
        })
        .select()
        .single();

      if (cognitiveError) throw cognitiveError;

      setSuccess(true);
      setTimeout(() => {
        onComplete(mriData.id, cognitiveData.id);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Patient Data</h2>
        <p className="text-gray-600">Upload MRI scans and enter cognitive test results for AI analysis</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Data uploaded successfully! Proceeding to preprocessing...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <FileImage className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">MRI Scan Upload</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Scan Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="2D"
                    checked={scanType === '2D'}
                    onChange={(e) => setScanType(e.target.value as '2D' | '3D')}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-700">2D Slice</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="3D"
                    checked={scanType === '3D'}
                    onChange={(e) => setScanType(e.target.value as '2D' | '3D')}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-700">3D Volume</span>
                </label>
              </div>
            </div>

            <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
              <input
                type="file"
                accept="image/*,.nii,.nii.gz"
                onChange={handleMRIFileChange}
                className="hidden"
                id="mri-upload"
                required
              />
              <label htmlFor="mri-upload" className="cursor-pointer">
                {mriPreview ? (
                  <div className="space-y-4">
                    <img src={mriPreview} alt="MRI Preview" className="mx-auto max-h-48 rounded-lg" />
                    <p className="text-sm text-green-600 font-medium">{mriFile?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-green-600 mx-auto" />
                    <div>
                      <p className="text-gray-700 font-medium">Click to upload MRI scan</p>
                      <p className="text-sm text-gray-500">PNG, JPG, NII formats supported</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Cognitive Test Scores</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span>MMSE Score (0-30)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.01"
                  value={mmseScore}
                  onChange={(e) => setMmseScore(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 24.5"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Mini-Mental State Examination</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-green-600" />
                  <span>Memory Score (0-100)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={memoryScore}
                  onChange={(e) => setMemoryScore(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 78.3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span>Attention Score (0-100)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={attentionScore}
                  onChange={(e) => setAttentionScore(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 85.7"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span>Reasoning Score (0-100)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={reasoningScore}
                  onChange={(e) => setReasoningScore(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 72.1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none"
                  placeholder="Additional observations..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={uploading || !mriFile}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>{uploading ? 'Uploading...' : 'Upload & Continue to Preprocessing'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
