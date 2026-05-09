"use client";
import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '@/src/actions/trade';

const ConfidenceIndex = () => {
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        if (data) {
          setConfidence(data.avgConfidence);
        }
      } catch (error) {
        console.error("Failed to load confidence stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1e2330] rounded-xl p-5 border border-white/5 animate-pulse mt-4 p-3 mx-3">
        <div className="h-6 bg-white/5 rounded w-1/4 mb-4"></div>
        <div className="h-2 bg-white/5 rounded w-full mb-4"></div>
        <div className="h-4 bg-white/5 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  if (confidence === null || confidence === 0) return null;

  // Calculate percentage (1-10 scale)
  const percentage = (confidence / 10) * 100;

  const getMessage = (val: number) => {
    if (val < 4) return "Low Confidence - You might be struggling with trading psychology right now.";
    if (val < 7) return "Neutral - You are maintaining discipline, but there's room for improvement.";
    return "High Confidence - You are trading well with consistent focus.";
  };

  return (
    <div className="bg-[#1e2330] rounded-xl p-6 border border-white/5 mt-4 mx-3">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white tracking-wide">Confidence Index</h2>
        <span className="text-blue-400 font-medium text-sm">Last 30 Days</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className="text-red-400 text-sm font-semibold">Low</span>
        
        {/* Progress Bar Container */}
        <div className="relative flex-1 h-3 rounded-full bg-gray-800">
          {/* Gradient Track */}
          <div className="absolute inset-0 rounded-full bg-linear-to-r from-[#FF5757] via-[#FFB732] to-[#34D399]" />
          
          {/* Knob */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-[#3B82F6] rounded-full border-2 border-[#1e2330] shadow-lg transition-all duration-1000 ease-out"
            style={{ left: `calc(${percentage}% - 10px)` }}
          />
        </div>

        <span className="text-[#34D399] text-sm font-semibold">High</span>
      </div>

      <div className="text-center text-sm text-gray-400 mt-6 font-medium">
        {getMessage(confidence)}
      </div>
    </div>
  );
};

export default ConfidenceIndex;
