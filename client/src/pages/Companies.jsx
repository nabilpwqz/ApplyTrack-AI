import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesAPI } from '../services/api.js';
import { ShieldCheck, ShieldAlert, Sparkles, Building2, Globe, Users, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Companies = () => {
  const queryClient = useQueryClient();
  const [analyzingId, setAnalyzingId] = useState(null);

  // Fetch unique tracked companies
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['trackedCompanies'],
    queryFn: companiesAPI.getAll,
  });

  // Re-run AI Company Health Analysis
  const analyzeMutation = useMutation({
    mutationFn: (id) => companiesAPI.analyze(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(`Successfully analyzed ${res.data.name}!`);
        queryClient.invalidateQueries(['trackedCompanies']);
      }
      setAnalyzingId(null);
    },
    onError: (err) => {
      toast.error('Health audit failed: ' + err.message);
      setAnalyzingId(null);
    }
  });

  const handleAuditTrigger = (id) => {
    setAnalyzingId(id);
    analyzeMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-slate-400 text-sm">Evaluating company credentials...</p>
      </div>
    );
  }

  const companiesList = companiesData?.data || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Corporate Risk & Health Intelligence</h1>
        <p className="text-xs text-slate-400">Monitor stability metrics, hiring volumes, and AI-estimated layoff risks</p>
      </div>

      {/* Grid of Company dossier cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {companiesList.map((comp) => {
          const isHighRisk = comp.layoffRisk > 25;
          const isHealthy = comp.healthScore >= 75;

          return (
            <div key={comp._id} className="glass-card rounded-2xl p-6 border-white/5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-neutral flex items-center justify-center border border-white/5 text-slate-300">
                      <Building2 className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{comp.name}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {comp.industry || 'Tech / Software'}
                      </p>
                    </div>
                  </div>

                  {comp.website && (
                    <a 
                      href={comp.website} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-neutral"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed truncate-3-lines">
                  {comp.description || `Metadata dossier logged for ${comp.name}. Evaluate hiring safety and benefits.`}
                </p>

                {/* Score Indicators Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-neutral-900/40 rounded-xl p-2.5 border border-white/5 text-center space-y-0.5">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Health Score</span>
                    <div className={`text-xl font-extrabold ${isHealthy ? 'text-teal-400' : 'text-slate-300'}`}>
                      {comp.healthScore}/100
                    </div>
                  </div>

                  <div className="bg-neutral-900/40 rounded-xl p-2.5 border border-white/5 text-center space-y-0.5">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Layoff Risk</span>
                    <div className={`text-xl font-extrabold ${isHighRisk ? 'text-error animate-pulse' : 'text-emerald-400'}`}>
                      {comp.layoffRisk}%
                    </div>
                  </div>
                </div>

                {/* AI factors list */}
                {comp.factors && comp.factors.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Risk Factors (Estimated)</span>
                    <div className="space-y-1 pl-1">
                      {comp.factors.slice(0, 3).map((factor, idx) => (
                        <p key={idx} className="text-[10px] text-slate-300 flex items-start gap-1 leading-relaxed">
                          {factor.startsWith('+') ? '🟢' : factor.startsWith('-') ? '🔴' : '⚪'} {factor.replace(/^[+-]/, '').trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-3 border-t border-white/5 items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {comp.size || '50-200 employees'}
                </span>
                
                <button 
                  onClick={() => handleAuditTrigger(comp._id)}
                  className="btn btn-xs btn-primary rounded"
                  disabled={analyzingId === comp._id}
                >
                  {analyzingId === comp._id ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Re-Analyze Health
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}

        {companiesList.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-500 text-sm glass-card rounded-2xl border-white/5">
            No companies registered yet. When you create or import job applications, corporate portfolios will populate here automatically.
          </div>
        )}
      </div>
    </div>
  );
};
export default Companies;
