import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api.ts';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Percent, 
  Calendar, 
  Activity
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: analyticsAPI.getSummary,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <span className="loading loading-spinner loading-lg text-amber-500"></span>
        <p className="text-slate-400 text-sm">Aggregating historical metrics...</p>
      </div>
    );
  }

  const payload = analyticsData?.data || {};
  const metrics = payload.metrics || {
    total: 0,
    active: 0,
    interviews: 0,
    offers: 0,
    responseRate: 0,
    interviewRate: 0,
    offerRate: 0,
    avgResponseDays: 0,
  };

  const funnel = payload.funnel || {
    SAVED: 0,
    APPLIED: 0,
    SCREENING: 0,
    ASSESSMENT: 0,
    INTERVIEW: 0,
    FINAL_INTERVIEW: 0,
    OFFER: 0,
    ACCEPTED: 0,
  };

  const weeklyTrend = payload.weeklyTrend || [];
  const sourceAnalysis = payload.sourceAnalysis || [];
  const companyAnalysis = payload.companyAnalysis || [];

  const colors = ['#f59e0b', '#d97706', '#f97316', '#eab308', '#ca8a04'];

  const funnelData = [
    { stage: 'Applied', count: funnel.APPLIED + funnel.SCREENING + funnel.ASSESSMENT + funnel.INTERVIEW + funnel.FINAL_INTERVIEW + funnel.OFFER + funnel.ACCEPTED },
    { stage: 'Screening', count: funnel.SCREENING + funnel.ASSESSMENT + funnel.INTERVIEW + funnel.FINAL_INTERVIEW + funnel.OFFER + funnel.ACCEPTED },
    { stage: 'Assessment', count: funnel.ASSESSMENT + funnel.INTERVIEW + funnel.FINAL_INTERVIEW + funnel.OFFER + funnel.ACCEPTED },
    { stage: 'Interview', count: funnel.INTERVIEW + funnel.FINAL_INTERVIEW + funnel.OFFER + funnel.ACCEPTED },
    { stage: 'Offer', count: funnel.OFFER + funnel.ACCEPTED },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Performance Analytics</h1>
        <p className="text-xs text-slate-400">Track source efficiencies, conversion rates, and volume metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral/20 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Percent className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xl font-bold text-white">{metrics.responseRate}%</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Response Rate</p>
          </div>
        </div>

        <div className="bg-neutral/20 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xl font-bold text-white">{metrics.interviewRate}%</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Interview Rate</p>
          </div>
        </div>

        <div className="bg-neutral/20 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
            <Percent className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xl font-bold text-white">{metrics.offerRate}%</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Offer Rate</p>
          </div>
        </div>

        <div className="bg-neutral/20 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-amber-600/10 flex items-center justify-center text-amber-500">
            <Calendar className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xl font-bold text-white">{metrics.avgResponseDays} days</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Avg Response time</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Funnel Conversion Rate</h3>
            <p className="text-xs text-slate-400">Total reach count by interview stage</p>
          </div>

          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={funnelData}
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="stage" type="category" stroke="#64748b" width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#182030', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Weekly Application Rates</h3>
            <p className="text-xs text-slate-400">Track job submissions by weekday</p>
          </div>

          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#182030', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Response Rate by Company Size</h3>
            <p className="text-xs text-slate-400">How company scale affects response conversion</p>
          </div>

          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={companyAnalysis}
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" stroke="#64748b" unit="%" />
                <YAxis dataKey="sizeGroup" type="category" stroke="#64748b" width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#182030', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                />
                <Bar dataKey="responseRate" fill="#d97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Job Source Conversion</h3>
            <p className="text-xs text-slate-400">Efficiency ratings by job sourcing channels</p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="table w-full text-slate-300 text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th>Sourcing Channel</th>
                  <th>Applications</th>
                  <th>Response Rate</th>
                  <th>Interview Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sourceAnalysis.map((src: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral/20 border-none">
                    <td className="font-semibold text-white">{src.source}</td>
                    <td>{src.applications}</td>
                    <td>{src.responseRate}%</td>
                    <td>
                      <span className="text-amber-400 font-bold">{src.interviewRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
