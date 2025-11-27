import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/Auth/AuthForm';
import { Navigation } from './components/Dashboard/Navigation';
import { UploadStep } from './components/Upload/UploadStep';
import { PreprocessingStep } from './components/Preprocessing/PreprocessingStep';
import { FeatureExtractionStep } from './components/FeatureExtraction/FeatureExtractionStep';
import { MultimodalFusionStep } from './components/Fusion/MultimodalFusionStep';
import { ResultsStep } from './components/Results/ResultsStep';
import { HistoryStep } from './components/History/HistoryStep';

const Dashboard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadId, setUploadId] = useState('');
  const [cognitiveTestId, setCognitiveTestId] = useState('');
  const [predictionId, setPredictionId] = useState('');

  const handleUploadComplete = (mriId: string, cogId: string) => {
    setUploadId(mriId);
    setCognitiveTestId(cogId);
    setCurrentStep(2);
  };

  const handlePreprocessingComplete = () => {
    setCurrentStep(3);
  };

  const handleFeatureExtractionComplete = () => {
    setCurrentStep(4);
  };

  const handleFusionComplete = (predId: string) => {
    setPredictionId(predId);
    setCurrentStep(5);
  };

  const handleResultsNext = () => {
    setCurrentStep(6);
  };

  const handleNewAnalysis = () => {
    setUploadId('');
    setCognitiveTestId('');
    setPredictionId('');
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Navigation currentStep={currentStep} onStepChange={setCurrentStep} />

      <main className="py-8">
        {currentStep === 1 && <UploadStep onComplete={handleUploadComplete} />}
        {currentStep === 2 && (
          <PreprocessingStep
            uploadId={uploadId}
            cognitiveTestId={cognitiveTestId}
            onComplete={handlePreprocessingComplete}
          />
        )}
        {currentStep === 3 && <FeatureExtractionStep onComplete={handleFeatureExtractionComplete} />}
        {currentStep === 4 && (
          <MultimodalFusionStep
            uploadId={uploadId}
            cognitiveTestId={cognitiveTestId}
            onComplete={handleFusionComplete}
          />
        )}
        {currentStep === 5 && predictionId && (
          <ResultsStep predictionId={predictionId} onNext={handleResultsNext} />
        )}
        {currentStep === 6 && <HistoryStep onNewAnalysis={handleNewAnalysis} />}
      </main>

      <footer className="bg-white border-t border-green-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            AI-Based Early Detection of Alzheimer's Disease • Department of CSE-AIML
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Using MRI scans and cognitive test data for multimodal AI analysis
          </p>
        </div>
      </footer>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
