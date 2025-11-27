import React, { useEffect, useState } from 'react';
import { Brain, AlertCircle, CheckCircle2, Activity, TrendingUp, Download, ArrowRight } from 'lucide-react';
import { supabase, Prediction, Recommendation } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type ResultsStepProps = {
  predictionId: string;
  onNext: () => void;
};

const stageInfo = {
  NC: {
    title: 'Normal Cognition',
    color: 'green',
    icon: CheckCircle2,
    description: 'No significant cognitive impairment detected',
  },
  MCI: {
    title: 'Mild Cognitive Impairment',
    color: 'yellow',
    icon: AlertCircle,
    description: 'Mild cognitive decline requiring monitoring',
  },
  AD: {
    title: "Alzheimer's Disease",
    color: 'red',
    icon: AlertCircle,
    description: 'Significant cognitive impairment detected',
  },
};

const recommendationsData = {
  NC: {
    lifestyle: [
      'Maintain regular physical exercise (30 min daily)',
      'Follow Mediterranean diet rich in omega-3',
      'Ensure 7-8 hours quality sleep',
      'Stay socially active and engaged',
      'Practice stress management techniques',
    ],
    medical: [
      'Continue routine annual checkups',
      'Monitor blood pressure and cholesterol',
      'Maintain healthy vitamin D levels',
    ],
    cognitive: [
      'Engage in puzzle-solving activities',
      'Learn new skills or languages',
      'Practice memory exercises',
      'Read regularly and engage in discussions',
    ],
    followup: 365,
  },
  MCI: {
    lifestyle: [
      'Increase physical activity to 45 min daily',
      'Adopt strict Mediterranean or MIND diet',
      'Optimize sleep schedule and quality',
      'Reduce alcohol consumption',
      'Manage stress through meditation or yoga',
    ],
    medical: [
      'Schedule neurological evaluation',
      'Consider cognitive enhancement medications',
      'Monitor cardiovascular health closely',
      'Check for vitamin B12 and D deficiency',
      'Discuss preventive therapies with neurologist',
    ],
    cognitive: [
      'Structured cognitive training programs',
      'Memory and attention exercises daily',
      'Learn new complex skills',
      'Practice mindfulness meditation',
      'Use memory aids and organizational tools',
    ],
    followup: 180,
  },
  AD: {
    lifestyle: [
      'Structured daily routine with assistance',
      'Safe home environment modifications',
      'Nutritional support and monitoring',
      'Gentle physical activity with supervision',
      'Maintain familiar social connections',
    ],
    medical: [
      'Consult neurologist for treatment plan',
      'Consider FDA-approved AD medications',
      'Evaluate eligibility for clinical trials',
      'Regular monitoring of disease progression',
      'Address co-existing health conditions',
      'Plan for long-term care needs',
    ],
    cognitive: [
      'Reality orientation therapy',
      'Reminiscence and validation therapy',
      'Simple memory exercises',
      'Music and art therapy',
      'Maintain engagement in familiar activities',
    ],
    followup: 90,
  },
};

export const ResultsStep: React.FC<ResultsStepProps> = ({ predictionId, onNext }) => {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: predData } = await supabase
        .from('predictions')
        .select('*')
        .eq('id', predictionId)
        .single();

      if (predData) {
        setPrediction(predData);

        const stage = predData.prediction_stage;
        const recData = recommendationsData[stage as keyof typeof recommendationsData];

        const { data: recResult } = await supabase
          .from('recommendations')
          .insert({
            prediction_id: predictionId,
            user_id: user!.id,
            stage: stage,
            lifestyle_recommendations: recData.lifestyle,
            medical_recommendations: recData.medical,
            cognitive_exercises: recData.cognitive,
            followup_interval_days: recData.followup,
          })
          .select()
          .single();

        if (recResult) {
          setRecommendation(recResult);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [predictionId, user]);

  if (loading || !prediction) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const stage = prediction.prediction_stage as keyof typeof stageInfo;
  const info = stageInfo[stage];
  const Icon = info.icon;

  const downloadReport = () => {
    const report = `
ALZHEIMER'S DETECTION AI - ANALYSIS REPORT
==========================================

Patient ID: ${user?.id}
Analysis Date: ${new Date(prediction.prediction_date).toLocaleDateString()}
Model Version: ${prediction.model_version}

PREDICTION RESULTS:
-------------------
Primary Diagnosis: ${info.title}
${info.description}

Confidence Scores:
- Normal Cognition: ${(prediction.confidence_nc * 100).toFixed(2)}%
- Mild Cognitive Impairment: ${(prediction.confidence_mci * 100).toFixed(2)}%
- Alzheimer's Disease: ${(prediction.confidence_ad * 100).toFixed(2)}%

Processing Time: ${prediction.processing_time_ms}ms

RECOMMENDATIONS:
----------------

Lifestyle Modifications:
${recommendation?.lifestyle_recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Medical Recommendations:
${recommendation?.medical_recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Cognitive Exercises:
${recommendation?.cognitive_exercises.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Follow-up: Recommended in ${recommendation?.followup_interval_days} days

---
This report is generated by AI and should be reviewed by a qualified healthcare professional.
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alzheimers_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Analysis Results</h2>
        <p className="text-gray-600">AI-powered prediction with personalized recommendations</p>
      </div>

      <div className={`bg-gradient-to-br from-${info.color}-50 to-white rounded-2xl shadow-xl border-2 border-${info.color}-200 p-8 mb-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`bg-${info.color}-500 p-4 rounded-2xl`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{info.title}</h3>
              <p className="text-gray-600">{info.description}</p>
            </div>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center space-x-2 bg-white px-6 py-3 rounded-lg border-2 border-green-500 text-green-600 hover:bg-green-50 transition-colors font-semibold"
          >
            <Download className="w-5 h-5" />
            <span>Download Report</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border border-green-200 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Normal Cognition</span>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{(prediction.confidence_nc * 100).toFixed(1)}%</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${prediction.confidence_nc * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-yellow-200 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">MCI</span>
              <Activity className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{(prediction.confidence_mci * 100).toFixed(1)}%</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${prediction.confidence_mci * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-red-200 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Alzheimer's</span>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{(prediction.confidence_ad * 100).toFixed(1)}%</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${prediction.confidence_ad * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {recommendation && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <TrendingUp className="w-7 h-7 text-green-600" />
            <span>Personalized Recommendations</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span>Lifestyle Modifications</span>
              </h4>
              <ul className="space-y-2">
                {recommendation.lifestyle_recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-green-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-green-600" />
                <span>Medical Recommendations</span>
              </h4>
              <ul className="space-y-2">
                {recommendation.medical_recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-green-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-green-600" />
                <span>Cognitive Exercises</span>
              </h4>
              <ul className="space-y-2">
                {recommendation.cognitive_exercises.map((rec, i) => (
                  <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-green-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold mb-2">Follow-up Recommendation</h4>
                <p className="text-green-100">
                  Next assessment recommended in {recommendation.followup_interval_days} days
                </p>
              </div>
              <button
                onClick={onNext}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center space-x-2"
              >
                <span>View History</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
