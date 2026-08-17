import React, { useState } from 'react';
import { aiAPI } from '../services/api.js';
import { 
  Sparkles, 
  FileSearch, 
  DollarSign, 
  Briefcase, 
  MapPin, 
  Award, 
  Copy, 
  Check, 
  AlertTriangle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AIHub = () => {
  const [activeTab, setActiveTab] = useState('MATCH'); // MATCH or SALARY

  // 1. Job Match states
  const [matchRole, setMatchRole] = useState('');
  const [matchCompany, setMatchCompany] = useState('');
  const [matchDesc, setMatchDesc] = useState('');
  const [matchingJob, setMatchingJob] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // 2. Salary Negotiation states
  const [offerAmount, setOfferAmount] = useState('');
  const [offerRole, setOfferRole] = useState('');
  const [offerLoc, setOfferLoc] = useState('');
  const [offerExp, setOfferExp] = useState('1 Year / Junior');
  const [evaluatingSalary, setEvaluatingSalary] = useState(false);
  const [salaryResult, setSalaryResult] = useState(null);

  // Copy states
  const [copiedText, setCopiedText] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success('Copied negotiation script to clipboard');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleMatchSubmit = async (e) => {
    e.preventDefault();
    if (!matchRole || !matchDesc) {
      return toast.error('Role Title and Job Description are required');
    }

    setMatchingJob(true);
    setMatchResult(null);
    const res = await aiAPI.checkJobMatch(matchRole, matchCompany, matchDesc);
    setMatchingJob(false);
    
    if (res.success) {
      setMatchResult(res.data);
      toast.success('Profile comparison complete!');
    } else {
      toast.error('Failed to run comparison: ' + res.message);
    }
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    if (!offerAmount || !offerRole) {
      return toast.error('Offer salary and Role Title are required');
    }

    setEvaluatingSalary(true);
    setSalaryResult(null);
    const res = await aiAPI.analyzeSalary(Number(offerAmount), offerRole, offerLoc || 'Remote', offerExp);
    setEvaluatingSalary(false);

    if (res.success) {
      setSalaryResult(res.data);
      toast.success('Compensation evaluation generated!');
    } else {
      toast.error('Benchmarking failed');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Career Command Hub</h1>
        <p className="text-xs text-slate-400">Evaluate posting matching percentages, review salary benchmarks, and draft scripts</p>
      </div>

      {/* Main Tab selector */}
      <div className="tabs tabs-boxed bg-neutral/40 border border-white/5 p-1 rounded-2xl w-fit flex gap-2 text-xs font-semibold">
        <button 
          onClick={() => setActiveTab('MATCH')}
          className={`tab px-5 py-2 rounded-xl flex items-center gap-2 ${activeTab === 'MATCH' ? 'tab-active bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}
        >
          <FileSearch className="w-4 h-4" />
          Job Match Score
        </button>
        <button 
          onClick={() => setActiveTab('SALARY')}
          className={`tab px-5 py-2 rounded-xl flex items-center gap-2 ${activeTab === 'SALARY' ? 'tab-active bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}
        >
          <DollarSign className="w-4 h-4" />
          Salary Advisor
        </button>
      </div>

      {/* Action panels */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Input Form */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-4">
          
          {/* JOB MATCH EVALUATOR */}
          {activeTab === 'MATCH' && (
            <form onSubmit={handleMatchSubmit} className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Profile Compatibility Test</h3>
                <p className="text-xs text-slate-400">Compares stored skills list against target postings</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-[10px] text-slate-500 font-bold uppercase py-0.5">Job Title *</label>
                  <input 
                    type="text"
                    placeholder="e.g. React Developer"
                    value={matchRole}
                    onChange={(e) => setMatchRole(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label text-[10px] text-slate-500 font-bold uppercase py-0.5">Company Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. OpenAI"
                    value={matchCompany}
                    onChange={(e) => setMatchCompany(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label text-[10px] text-slate-500 font-bold uppercase py-0.5">Raw Job Description *</label>
                <textarea 
                  placeholder="Paste details of the posting here to run evaluation..."
                  value={matchDesc}
                  onChange={(e) => setMatchDesc(e.target.value)}
                  className="textarea textarea-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg h-44 focus:outline-none focus:border-primary"
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                className="btn btn-sm btn-primary w-full rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
                disabled={matchingJob}
              >
                {matchingJob ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Evaluate Posting Compatibility
                  </>
                )}
              </button>
            </form>
          )}

          {/* SALARY ADVISOR */}
          {activeTab === 'SALARY' && (
            <form onSubmit={handleSalarySubmit} className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Salary Benchmarking</h3>
                <p className="text-xs text-slate-400">Evaluate current job offer package against region market rates</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-[10px] text-slate-500 font-bold uppercase py-0.5">Offered Base Salary ($) *</label>
                  <input 
                    type="number"
                    placeholder="e.g. 95000"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label text-[10px] text-slate-500 font-bold uppercase py-0.5">Job Title / Role *</label>
                  <input 
                    type="text"
                    placeholder="e.g. Frontend Engineer"
                    value={offerRole}
                    onChange={(e) => setOfferRole(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-[10px] text-slate-500 font-bold uppercase py-0.5">Location / City</label>
                  <input 
                    type="text"
                    placeholder="e.g. Austin, TX"
                    value={offerLoc}
                    onChange={(e) => setOfferLoc(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="form-control">
                  <label className="label text-[10px] text-slate-500 font-bold uppercase py-0.5">Experience Level</label>
                  <select
                    value={offerExp}
                    onChange={(e) => setOfferExp(e.target.value)}
                    className="select select-sm select-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg focus:outline-none"
                  >
                    <option value="Entry-level">Entry-level (0-1 yrs)</option>
                    <option value="Junior developer">Junior developer (1-3 yrs)</option>
                    <option value="Mid-level Engineer">Mid-level Engineer (3-5 yrs)</option>
                    <option value="Senior Developer">Senior Developer (5+ yrs)</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="btn btn-sm btn-primary w-full rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
                disabled={evaluatingSalary}
              >
                {evaluatingSalary ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Evaluate Compensation Pack
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Right Side: AI Output Results */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* JOB MATCH RESULTS */}
          {activeTab === 'MATCH' && (
            <div className="glass-card rounded-2xl p-6 border border-white/5 min-h-[440px] flex flex-col justify-center">
              {matchResult ? (
                <div className="space-y-5">
                  <div className="text-center py-4 bg-neutral-900/40 border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Job Compatibility Score</span>
                    <div className="text-5xl font-black text-gradient">{matchResult.matchScore}%</div>
                    <span className="badge badge-primary badge-sm font-semibold">{matchResult.result}</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Key Matching Factors</h4>
                    <div className="space-y-1.5">
                      {matchResult.factors?.map((f, i) => (
                        <p key={i} className={`text-xs leading-relaxed flex items-start gap-1.5 ${f.startsWith('✓') ? 'text-teal-400' : 'text-amber-400'}`}>
                          {f}
                        </p>
                      ))}
                    </div>
                  </div>

                  {matchResult.missingSkills && matchResult.missingSkills.length > 0 && (
                    <div className="space-y-2 bg-error/5 border border-error/10 rounded-xl p-3">
                      <h4 className="text-xs font-bold text-error uppercase tracking-wide flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Missing Stack Credentials
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {matchResult.missingSkills.map((skill, i) => (
                          <span key={i} className="badge badge-sm badge-outline border-error/30 text-error bg-error/10 rounded font-semibold uppercase text-[9px] tracking-wider px-2 py-1">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-primary" /> Application Advice
                    </h4>
                    <div className="space-y-1 pl-1">
                      {matchResult.recommendations?.map((rec, i) => (
                        <p key={i} className="text-xs text-slate-300 leading-relaxed">
                          • {rec}
                        </p>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center text-slate-500 space-y-2 flex flex-col items-center">
                  <FileSearch className="w-12 h-12 text-slate-600" />
                  <p className="font-medium text-sm">Waiting for job posting analysis</p>
                  <p className="text-xs text-slate-600 max-w-xs">
                    Paste the roles description and details into the left panel to test compatibility percentages.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SALARY ADVISOR RESULTS */}
          {activeTab === 'SALARY' && (
            <div className="glass-card rounded-2xl p-6 border border-white/5 min-h-[440px] flex flex-col justify-center">
              {salaryResult ? (
                <div className="space-y-5">
                  <div className="text-center py-4 bg-neutral-900/40 border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Salary Benchmarks</span>
                    <div className="text-3xl font-extrabold text-white">
                      ${salaryResult.marketMin.toLocaleString()} - ${salaryResult.marketMax.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-400 font-semibold pt-1">
                      Offer Evaluation:{' '}
                      <span className="text-warning font-extrabold">{salaryResult.offerEvaluation}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-neutral-900/30 border border-white/5 rounded-xl text-center space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Counter Target</span>
                      <div className="text-lg font-bold text-teal-400">${salaryResult.targetSalary.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-neutral-900/30 border border-white/5 rounded-xl text-center space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Acceptable Floor</span>
                      <div className="text-lg font-bold text-slate-300">${salaryResult.acceptableSalary.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Leverage Points</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 leading-relaxed">
                      {salaryResult.leverageFactors?.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Recruiter script email box */}
                  <div className="p-3 bg-neutral-900/50 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center pb-1 border-b border-white/5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Negotiation Message Template</span>
                      <button 
                        onClick={() => handleCopy(salaryResult.negotiationEmail)}
                        className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto font-sans">
                      {salaryResult.negotiationEmail}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 space-y-2 flex flex-col items-center">
                  <DollarSign className="w-12 h-12 text-slate-600" />
                  <p className="font-medium text-sm">Waiting for offer statistics</p>
                  <p className="text-xs text-slate-600 max-w-xs">
                    Input your job offer details in the left panel to generate counter targets, strategy guides, and email pitches.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
export default AIHub;
