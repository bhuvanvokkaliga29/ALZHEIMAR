import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2, Loader2, Brain, BarChart2 } from 'lucide-react';

type PreprocessingStepProps = {
  uploadId: string;
  cognitiveTestId: string;
  onComplete: () => void;
};

const preprocessingStages = [
  { id: 1, name: 'Skull Stripping', description: 'Removing non-brain tissue', duration: 800 },
  { id: 2, name: 'Image Resizing', description: 'Normalizing dimensions to 224×224', duration: 600 },
  { id: 3, name: 'Intensity Normalization', description: 'Standardizing pixel values', duration: 700 },
  { id: 4, name: 'Data Augmentation', description: 'Rotation, flip, zoom transformations', duration: 900 },
  { id: 5, name: 'Cognitive Data Processing', description: 'Normalizing test scores', duration: 500 },
];

export const PreprocessingStep: React.FC<PreprocessingStepProps> = ({ onComplete }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  useEffect(() => {
    if (currentStage < preprocessingStages.length) {
      const stage = preprocessingStages[currentStage];
      const timer = setTimeout(() => {
        setCompletedStages([...completedStages, stage.id]);
        setCurrentStage(currentStage + 1);
      }, stage.duration);

      return () => clearTimeout(timer);
    } else if (currentStage === preprocessingStages.length) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [currentStage, completedStages, onComplete]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Data Preprocessing</h2>
        <p className="text-gray-600">Preparing MRI scans and cognitive data for AI analysis</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 mb-6">
        <div className="space-y-6">
          {preprocessingStages.map((stage, index) => {
            const isCompleted = completedStages.includes(stage.id);
            const isActive = currentStage === index;

            return (
              <div key={stage.id} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500'
                    : isActive
                    ? 'bg-green-100 animate-pulse'
                    : 'bg-gray-100'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : isActive ? (
                    <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                  ) : (
                    <span className="text-gray-400 font-semibold">{stage.id}</span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${
                    isCompleted ? 'text-green-600' : isActive ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {stage.name}
                  </h3>
                  <p className={`text-sm ${
                    isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {stage.description}
                  </p>

                  {isActive && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-progress" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg border border-green-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">MRI Processing</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Original Size:</span>
              <span className="font-semibold">512 × 512 px</span>
            </div>
            <div className="flex justify-between">
              <span>Processed Size:</span>
              <span className="font-semibold text-green-600">224 × 224 px</span>
            </div>
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="font-semibold">Normalized Grayscale</span>
            </div>
            <div className="flex justify-between">
              <span>Augmentations:</span>
              <span className="font-semibold">5× variants</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg border border-green-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <BarChart2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Cognitive Data</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>MMSE:</span>
              <span className="font-semibold text-green-600">Normalized</span>
            </div>
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className="font-semibold text-green-600">Normalized</span>
            </div>
            <div className="flex justify-between">
              <span>Attention:</span>
              <span className="font-semibold text-green-600">Normalized</span>
            </div>
            <div className="flex justify-between">
              <span>Reasoning:</span>
              <span className="font-semibold text-green-600">Normalized</span>
            </div>
          </div>
        </div>
      </div>

      {currentStage === preprocessingStages.length && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-6 py-3 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Preprocessing Complete! Proceeding to feature extraction...</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 0.8s ease-in-out;
        }
      `}</style>
    </div>
  );
};
