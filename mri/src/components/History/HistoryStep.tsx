import React, { useEffect, useState } from 'react';
import { BarChart3, Brain, Calendar, TrendingUp, Activity, Target } from 'lucide-react';
import { supabase, Prediction, ModelMetrics } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type HistoryStepProps = {
  onNewAnalysis: () => void;
};

export const HistoryStep: React.FC<HistoryStepProps> = ({ onNewAnalysis }) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: predData } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user!.id)
        .order('prediction_date', { ascending: false });

      if (predData) {
        setPredictions(predData);
      }

      const { data: metricsData } = await supabase
        .from('model_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (metricsData) {
        setMetrics(metricsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  const stageColors = {
    NC: { bg: 'bg-green-100', text: 'text-green-700', label: 'Normal' },
    MCI: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'MCI' },
    AD: { bg: 'bg-red-100', text: 'text-red-700', label: "Alzheimer's" },
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Analysis History & Model Performance</h2>
            <p className="text-gray-600">View past predictions and AI model metrics</p>
          </div>
          <button
            onClick={onNewAnalysis}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
          >
            + New Analysis
          </button>
        </div>
      </div>

      {metrics && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Target className="w-7 h-7 text-green-600" />
            <span>AI Model Performance Metrics</span>
          </h3>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-sm mb-1 text-green-100">Overall Accuracy</p>
              <p className="text-4xl font-bold">{(metrics.accuracy * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-lg">
              <p className="text-sm mb-1 text-gray-600">F1-Score</p>
              <p className="text-4xl font-bold text-green-600">{(metrics.f1_score * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-lg">
              <p className="text-sm mb-1 text-gray-600">ROC-AUC</p>
              <p className="text-4xl font-bold text-green-600">{(metrics.roc_auc * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-lg">
              <p className="text-sm mb-1 text-gray-600">Model Version</p>
              <p className="text-4xl font-bold text-green-600">{metrics.model_version}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6 mb-6">
            <h4 className="text-xl font-bold text-gray-800 mb-4">Precision & Recall by Stage</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h5 className="font-semibold text-green-700 mb-3">Normal Cognition</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Precision:</span>
                    <span className="font-bold text-gray-800">{(metrics.precision_nc * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recall:</span>
                    <span className="font-bold text-gray-800">{(metrics.recall_nc * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-yellow-700 mb-3">Mild Cognitive Impairment</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Precision:</span>
                    <span className="font-bold text-gray-800">{(metrics.precision_mci * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recall:</span>
                    <span className="font-bold text-gray-800">{(metrics.recall_mci * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-red-700 mb-3">Alzheimer's Disease</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Precision:</span>
                    <span className="font-bold text-gray-800">{(metrics.precision_ad * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recall:</span>
                    <span className="font-bold text-gray-800">{(metrics.recall_ad * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
            <h4 className="text-xl font-bold text-gray-800 mb-4">Confusion Matrix</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Actual / Predicted</th>
                    <th className="p-3 text-center text-sm font-semibold text-green-700">NC</th>
                    <th className="p-3 text-center text-sm font-semibold text-yellow-700">MCI</th>
                    <th className="p-3 text-center text-sm font-semibold text-red-700">AD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3 font-semibold text-green-700">NC</td>
                    <td className="p-3 text-center bg-green-100 font-bold">{metrics.confusion_matrix.NC.NC}</td>
                    <td className="p-3 text-center">{metrics.confusion_matrix.NC.MCI}</td>
                    <td className="p-3 text-center">{metrics.confusion_matrix.NC.AD}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-semibold text-yellow-700">MCI</td>
                    <td className="p-3 text-center">{metrics.confusion_matrix.MCI.NC}</td>
                    <td className="p-3 text-center bg-yellow-100 font-bold">{metrics.confusion_matrix.MCI.MCI}</td>
                    <td className="p-3 text-center">{metrics.confusion_matrix.MCI.AD}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-semibold text-red-700">AD</td>
                    <td className="p-3 text-center">{metrics.confusion_matrix.AD.NC}</td>
                    <td className="p-3 text-center">{metrics.confusion_matrix.AD.MCI}</td>
                    <td className="p-3 text-center bg-red-100 font-bold">{metrics.confusion_matrix.AD.AD}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-7 h-7 text-green-600" />
          <span>Your Analysis History</span>
        </h3>

        {predictions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-12 text-center">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">No analyses yet</p>
            <button
              onClick={onNewAnalysis}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
            >
              Start Your First Analysis
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((pred) => {
              const colors = stageColors[pred.prediction_stage as keyof typeof stageColors];
              return (
                <div key={pred.id} className="bg-white rounded-xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`${colors.bg} p-3 rounded-xl`}>
                        <Brain className={`w-8 h-8 ${colors.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-sm font-bold`}>
                            {colors.label}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600 flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(pred.prediction_date).toLocaleDateString()}</span>
                          </span>
                        </div>
                        <div className="flex space-x-6 text-sm text-gray-600">
                          <span>NC: {(pred.confidence_nc * 100).toFixed(1)}%</span>
                          <span>MCI: {(pred.confidence_mci * 100).toFixed(1)}%</span>
                          <span>AD: {(pred.confidence_ad * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Model v{pred.model_version}</p>
                      <p className="text-xs text-gray-500">{pred.processing_time_ms}ms</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
