import React from 'react';
import { Brain, Upload, Settings, Database, Target, FileText, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type NavigationProps = {
  currentStep: number;
  onStepChange: (step: number) => void;
};

const steps = [
  { id: 1, name: 'Upload Data', icon: Upload, description: 'MRI & Cognitive Tests' },
  { id: 2, name: 'Preprocessing', icon: Settings, description: 'Data Preparation' },
  { id: 3, name: 'Feature Extraction', icon: Database, description: 'CNN & ML Analysis' },
  { id: 4, name: 'Multimodall Fusion', icon: Target, description: 'Model Integration' },
  { id: 5, name: 'Results', icon: FileText, description: 'Predictions & Insights' },
  { id: 6, name: 'History', icon: BarChart3, description: 'Past Analyses' },
];

export const Navigation: React.FC<NavigationProps> = ({ currentStep, onStepChange }) => {
  const { profile, signOut } = useAuth();

  return (
    <nav className="bg-white border-b border-green-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Alzheimer's Detection AI</h1>
              <p className="text-xs text-gray-600">Early Detection Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{profile?.full_name}</p>
              <p className="text-xs text-gray-600">{profile?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
        </div>

        <div className="flex space-x-1 pb-4 overflow-x-auto scrollbar-hide">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => onStepChange(step.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : isCompleted
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-sm font-semibold">{step.name}</div>
                  <div className={`text-xs ${isActive ? 'text-green-100' : 'text-gray-500'}`}>
                    {step.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
