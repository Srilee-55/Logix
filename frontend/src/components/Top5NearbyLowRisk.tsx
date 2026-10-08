import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { fetchTop5Recommendations, prioritizeOrderApi } from '../services/api';

export const Top5NearbyLowRisk: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await fetchTop5Recommendations();
      setRecommendations(data.recommendations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handlePrioritize = async (orderId: string) => {
    try {
      await prioritizeOrderApi(orderId);
      loadRecommendations();
      alert(`Order ${orderId} has been prioritized for delivery.`);
    } catch (e) {
      console.error(e);
      alert('Failed to prioritize order');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-pulse mt-6">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded"></div>)}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mt-6">
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-emerald-600" />
          Top 5 Nearby Low-Risk Deliveries
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Recommended orders to prioritize first based on distance, traffic, and risk level.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {recommendations.map((rec, idx) => (
          <div key={rec.order_id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm shrink-0">
                #{idx + 1}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{rec.customer_name}</span>
                  <span className="text-xs font-mono text-slate-500 px-2 py-0.5 bg-slate-100 rounded">{rec.order_id}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    SCORE: {rec.recommendation_score}
                  </span>
                </div>
                
                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 mb-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {rec.distance_km} km away ({rec.delivery_location})</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {rec.traffic_level} Traffic</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {rec.delivery_window}</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {rec.reliability_score}% Reliable</span>
                </div>

                <p className="text-[11px] text-slate-500 italic border-l-2 border-slate-200 pl-2">
                  {rec.why_reason}
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePrioritize(rec.order_id)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all shrink-0 w-full md:w-auto cursor-pointer"
            >
              Prioritize Delivery
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
