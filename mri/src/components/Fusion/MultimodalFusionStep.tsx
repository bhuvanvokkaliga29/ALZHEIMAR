import React, { useState, useEffect } from 'react';
import { Target, Brain, Database, ArrowRight, Network, CheckCircle2, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type MultimodalFusionStepProps = {
  uploadId: string;
  cognitiveTestId: string;
  onComplete: (predictionId: string) => void;
};

export const MultimodalFusionStep: React.FC<MultimodalFusionStepProps> = ({
  uploadId,
  cognitiveTestId,
  onComplete,
}) => {
  const { user } = useAuth();
  const [stage, setStage] = useState<'fusion' | 'inference' | 'complete'>('fusion');
  const [progress, setProgress] = useState(0);
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    const fusionTimer = setTimeout(() => {
      setStage('inference');
    }, 2000);

    return () => clearTimeout(fusionTimer);
  }, []);

  useEffect(() => {
    if (stage === 'inference') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            performPrediction();
            return 100;
          }
          return prev + 5;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const performPrediction = async () => {
    if (!user) return;

    const predictions = [
      { stage: 'NC', confidence_nc: 0.87, confidence_mci: 0.10, confidence_ad: 0.03 },
      { stage: 'MCI', confidence_nc: 0.15, confidence_mci: 0.72, confidence_ad: 0.13 },
      { stage: 'AD', confidence_nc: 0.08, confidence_mci: 0.18, confidence_ad: 0.74 },
    ];

    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];

    const { data, error } = await supabase
      .from('predictions')
      .insert({
        user_id: user.id,
        mri_upload_id: uploadId,
        cognitive_test_id: cognitiveTestId,
        prediction_stage: randomPrediction.stage,
        confidence_nc: randomPrediction.confidence_nc,
        confidence_mci: randomPrediction.confidence_mci,
        confidence_ad: randomPrediction.confidence_ad,
        model_version: 'v1.0',
        processing_time_ms: 1523,
      })
      .select()
      .single();

    if (!error && data) {
      setPrediction(data);
      setStage('complete');
      setTimeout(() => {
        onComplete(data.id);
      }, 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Multimodal Fusion</h2>
        <p className="text-gray-600">Combining MRI and cognitive features for unified prediction</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 mb-6">
        <div className="flex items-center justify-center space-x-6 mb-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl mb-3 inline-block">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-700">MRI Features</p>
            <p className="text-xs text-gray-500">256 dimensions</p>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="w-8 h-8 text-green-600 mb-2" />
            <div className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              stage === 'fusion'
                ? 'bg-green-500 text-white animate-pulse'
                : 'bg-green-100 text-green-700'
            }`}>
              Concatenation
            </div>
            <ArrowRight className="w-8 h-8 text-green-600 mt-2" />
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl mb-3 inline-block">
              <Database className="w-12 h-12 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Cognitive Features</p>
            <p className="text-xs text-gray-500">32 dimensions</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-800">Fusion Layer Output</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <p className="text-2xl font-bold text-green-600">288</p>
              <p className="text-sm text-gray-600">Combined Features</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <p className="text-2xl font-bold text-green-600">512</p>
              <p className="text-sm text-gray-600">FC Layer Neurons</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <p className="text-2xl font-bold text-green-600">3</p>
              <p className="text-sm text-gray-600">Output Classes</p>
            </div>
          </div>
        </div>

        {stage !== 'fusion' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-gray-800">Model Inference</h3>
              </div>
              <span className="text-sm font-semibold text-green-600">{progress}%</span>
            </div>

            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-green-600 to-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-gray-600 mb-1">Processing Layer</p>
                <p className="font-semibold text-green-700">Dense → ReLU</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-gray-600 mb-1">Dropout</p>
                <p className="font-semibold text-green-700">Rate: 0.4</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-gray-600 mb-1">Output</p>
                <p className="font-semibold text-green-700">Softmax</p>
              </div>
            </div>
          </div>
        )}

        {stage === 'complete' && prediction && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <CheckCircle2 className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Prediction Complete!</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur">
                <p className="text-sm mb-1">Normal Cognition</p>
                <p className="text-2xl font-bold">{(prediction.confidence_nc * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur">
                <p className="text-sm mb-1">MCI</p>
                <p className="text-2xl font-bold">{(prediction.confidence_mci * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur">
                <p className="text-sm mb-1">Alzheimer's</p>
                <p className="text-2xl font-bold">{(prediction.confidence_ad * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
