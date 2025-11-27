import React, { useState, useEffect } from 'react';
import { Database, Brain, Network, Layers, CheckCircle2 } from 'lucide-react';

type FeatureExtractionStepProps = {
  onComplete: () => void;
};

export const FeatureExtractionStep: React.FC<FeatureExtractionStepProps> = ({ onComplete }) => {
  const [mriProgress, setMriProgress] = useState(0);
  const [cognitiveProgress, setCognitiveProgress] = useState(0);
  const [stage, setStage] = useState<'mri' | 'cognitive' | 'complete'>('mri');

  useEffect(() => {
    if (stage === 'mri') {
      const interval = setInterval(() => {
        setMriProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage('cognitive'), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
      return () => clearInterval(interval);
    } else if (stage === 'cognitive') {
      const interval = setInterval(() => {
        setCognitiveProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStage('complete');
              setTimeout(() => onComplete(), 1500);
            }, 500);
            return 100;
          }
          return prev + 3;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [stage, onComplete]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Feature Extraction</h2>
        <p className="text-gray-600">Extracting deep features using CNN and ML models</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className={`bg-white rounded-2xl shadow-lg border p-6 transition-all duration-300 ${
          stage === 'mri' ? 'border-green-500 ring-2 ring-green-200' : 'border-green-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">MRI Feature Extraction</h3>
            </div>
            {mriProgress === 100 && <CheckCircle2 className="w-6 h-6 text-green-500" />}
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">CNN Architecture</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-green-600" />
                  <span>Input Layer: 224×224×1</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Network className="w-4 h-4 text-green-600" />
                  <span>Conv2D Layers: 64, 128, 256 filters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-green-600" />
                  <span>MaxPooling + Dropout (0.3)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Network className="w-4 h-4 text-green-600" />
                  <span>Dense: 512 → 256 features</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Extraction Progress</span>
                <span className="font-semibold text-green-600">{mriProgress}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300 rounded-full"
                  style={{ width: `${mriProgress}%` }}
                />
              </div>
            </div>

            {mriProgress === 100 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Extracted 256 structural features from MRI scan
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`bg-white rounded-2xl shadow-lg border p-6 transition-all duration-300 ${
          stage === 'cognitive' ? 'border-green-500 ring-2 ring-green-200' : 'border-green-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Cognitive Feature Extraction</h3>
            </div>
            {cognitiveProgress === 100 && <CheckCircle2 className="w-6 h-6 text-green-500" />}
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Dense Network Architecture</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <Network className="w-4 h-4 text-green-600" />
                  <span>Input: 4 normalized scores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-green-600" />
                  <span>Dense Layers: 64 → 32 neurons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-green-600" />
                  <span>Activation: ReLU + Dropout (0.2)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Network className="w-4 h-4 text-green-600" />
                  <span>Output: 32 cognitive features</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Extraction Progress</span>
                <span className="font-semibold text-green-600">{cognitiveProgress}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300 rounded-full"
                  style={{ width: `${cognitiveProgress}%` }}
                />
              </div>
            </div>

            {cognitiveProgress === 100 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Extracted 32 cognitive performance features
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {stage === 'complete' && (
        <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl shadow-lg border border-green-200 p-6">
          <div className="flex items-center justify-center space-x-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-800">Feature Extraction Complete!</h3>
              <p className="text-gray-600">Total: 288 features extracted (256 MRI + 32 Cognitive)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
