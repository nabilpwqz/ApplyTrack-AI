import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsAPI, aiAPI } from '../services/api.ts';
import { Application, ApplicationStatus, RecruiterContact } from '../types/index.ts';
import { 
  MapPin, 
  DollarSign, 
  Sparkles, 
  Plus, 
  Copy, 
  Trash2, 
  ArrowLeft,
  X,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeAITab, setActiveAITab] = useState<'FOLLOWUP' | 'PROBABILITY' | 'PREP' | 'SALARY'>('FOLLOWUP');

  // AI Follow-up settings state
  const [tone, setTone] = useState<string>('Professional');
  const [customInfo, setCustomInfo] = useState<string>('');
  const [generatedEmail, setGeneratedEmail] = useState<any>(null);
  const [generatingFollowUp, setGeneratingFollowUp] = useState<boolean>(false);

  // AI Salary offer inputs
  const [salaryBenchmarked, setSalaryBenchmarked] = useState<any>(null);
  const [benchmarkingSalary, setBenchmarkingSalary] = useState<boolean>(false);

  // Manual timeline logs state
  const [logTitle, setLogTitle] = useState<string>('');
  const [logDesc, setLogDesc] = useState<string>('');
  const [logType, setLogType] = useState<string>('NOTE');
  const [timelineModal, setTimelineModal] = useState<boolean>(false);

  // Manual Contact logs state
  const [contactName, setContactName] = useState<string>('');
  const [contactRole, setContactRole] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactModal, setContactModal] = useState<boolean>(false);

  // 1. Fetch Application Details
  const { data: detailsData, isLoading } = useQuery({
    queryKey: ['applicationDetails', id],
    queryFn: () => applicationsAPI.getById(id!),
    enabled: !!id,
  });

  // Mutate: Update Status
  const updateStatusMutation = useMutation({
    mutationFn: (status: ApplicationStatus) => applicationsAPI.update(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['applicationsList'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
      toast.success('Application status updated');
    },
  });

  // Mutate: Add Timeline event
  const addTimelineEventMutation = useMutation({
    mutationFn: (eventData: any) => applicationsAPI.addTimelineEvent(id!, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationDetails', id] });
      toast.success('Timeline event added successfully');
      setTimelineModal(false);
      setLogTitle('');
      setLogDesc('');
    },
  });

  // Mutate: Delete Application
  const deleteMutation = useMutation({
    mutationFn: () => applicationsAPI.delete(id!),
    onSuccess: () => {
      toast.success('Application deleted successfully');
      navigate('/dashboard/applications');
    },
  });

  // Mutate: Add Recruiter Contact
  const addContactMutation = useMutation({
    mutationFn: (contactsList: RecruiterContact[]) => applicationsAPI.update(id!, { contacts: contactsList }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationDetails', id] });
      toast.success('Recruiter contact added');
      setContactModal(false);
      setContactName('');
      setContactRole('');
      setContactEmail('');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
        <span className="loading loading-spinner loading-lg text-amber-500"></span>
        <p className="text-slate-400 text-sm">Opening job dossier...</p>
      </div>
    );
  }

  const payload: any = detailsData?.data || {};
  const app: Application = payload.application || {};
  const analyses = payload.aiAnalyses || [];

  const probAnalysis = analyses.find((a: any) => a.type === 'INTERVIEW_PROBABILITY');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied text to clipboard');
  };

  const handleGenerateFollowUp = async () => {
    if (!id) return;
    setGeneratingFollowUp(true);
    const res = await aiAPI.generateFollowUp(id, tone, customInfo);
    setGeneratingFollowUp(false);
    if (res.success && res.data) {
      setGeneratedEmail(res.data);
    } else {
      toast.error('Failed to generate draft');
    }
  };

  const handleBenchmarkSalary = async () => {
    setBenchmarkingSalary(true);
    const offeredAmount = app.salary?.max || 90000;
    const res = await aiAPI.analyzeSalary(offeredAmount, app.jobTitle, app.location || 'Remote', 'JUNIOR');
    setBenchmarkingSalary(false);
    if (res.success && res.data) {
      setSalaryBenchmarked(res.data);
    } else {
      toast.error('Failed to calculate benchmarks');
    }
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle) return toast.error('Event title is required');
    addTimelineEventMutation.mutate({
      type: logType,
      title: logTitle,
      description: logDesc,
      occurredAt: new Date(),
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName) return toast.error('Name is required');
    
    const existingContacts = app.contacts || [];
    const newContacts: RecruiterContact[] = [...existingContacts, {
      name: contactName,
      role: contactRole || 'Recruiter',
      email: contactEmail,
    }];

    addContactMutation.mutate(newContacts);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SAVED': return 'badge-neutral text-slate-300';
      case 'APPLIED': return 'badge-primary text-slate-950 font-bold';
      case 'SCREENING': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'ASSESSMENT': return 'badge-warning text-slate-950 font-bold';
      case 'INTERVIEW':
      case 'FINAL_INTERVIEW': return 'badge-secondary text-white font-bold';
      case 'OFFER': return 'badge-warning text-slate-950 font-bold animate-pulse';
      case 'ACCEPTED': return 'bg-amber-400 text-slate-950 font-bold';
      case 'REJECTED': return 'badge-error text-white font-bold';
      case 'GHOSTED': return 'badge-ghost border border-white/10 text-slate-400';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Breadcrumb Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <Link 
          to="/dashboard/applications"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </Link>
        
        <button 
          onClick={() => {
            if (window.confirm('Delete this application permanently?')) {
              deleteMutation.mutate();
            }
          }}
          className="btn btn-ghost btn-xs text-error hover:bg-error/10 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Delete dossier
        </button>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className={`badge ${getStatusBadge(app.status)} badge-sm uppercase font-semibold`}>
              {app.status}
            </span>
            <span className="text-xs bg-neutral/80 border border-white/5 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">
              {app.priority} Priority
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            {app.jobTitle}
          </h1>
          <p className="text-slate-400 font-medium flex items-center gap-2 text-sm">
            {app.companyId ? app.companyId.name : app.companyName || 'Company'} • 
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-4 h-4" /> {app.location || 'Remote'} ({app.workMode})
            </span>
          </p>
        </div>

        {/* Status quick switcher */}
        <div className="form-control">
          <label className="label py-1 text-slate-500 text-[10px] uppercase font-bold">Change stage</label>
          <select 
            value={app.status}
            onChange={(e) => updateStatusMutation.mutate(e.target.value as ApplicationStatus)}
            className="select select-sm select-bordered bg-neutral border-white/10 text-white rounded-lg text-xs font-semibold focus:outline-none"
          >
            <option value="SAVED">Saved</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="ASSESSMENT">Assessment</option>
            <option value="INTERVIEW">Interview Loop</option>
            <option value="FINAL_INTERVIEW">Final Interview</option>
            <option value="OFFER">Offer</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
            <option value="GHOSTED">Ghosted</option>
          </select>
        </div>
      </div>

      {/* Main split details view */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Timeline, Contacts, Notes */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Metadata Row */}
          <div className="grid grid-cols-3 gap-4 bg-neutral/20 border border-white/5 rounded-2xl p-4">
            <div className="text-center md:text-left space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Salary Range</span>
              <p className="text-sm font-bold text-white flex items-center justify-center md:justify-start">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                {app.salary?.min ? `${app.salary.min.toLocaleString()} - ${app.salary.max?.toLocaleString()}` : 'Not Spec'}
              </p>
            </div>
            <div className="text-center md:text-left space-y-1 border-x border-white/5 px-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Application Source</span>
              <p className="text-sm font-bold text-slate-300 truncate">{app.source || 'Website'}</p>
            </div>
            <div className="text-center md:text-left space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Applied Date</span>
              <p className="text-sm font-bold text-slate-300">
                {new Date(app.applicationDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Timeline widgets */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Application Timeline</h3>
                <p className="text-[10px] text-slate-400">Events and recruiter interactions log</p>
              </div>
              <button 
                onClick={() => setTimelineModal(true)}
                className="btn btn-xs btn-primary text-slate-950 font-bold rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Log event
              </button>
            </div>

            <div className="relative pl-6 space-y-6 border-l-2 border-white/5">
              {app.timeline && [...app.timeline].reverse().map((event, idx) => (
                <div key={idx} className="relative space-y-1">
                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-amber-500 border-4 border-[#0f172a] shadow"></span>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">{event.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(event.occurredAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter Contacts */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Recruiter Contacts</h3>
                <p className="text-[10px] text-slate-400">Direct connections at {app.companyId?.name || app.companyName || 'Company'}</p>
              </div>
              <button 
                onClick={() => setContactModal(true)}
                className="btn btn-xs btn-outline border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add contact
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {app.contacts?.map((contact, idx) => (
                <div key={idx} className="p-3 bg-neutral/40 rounded-xl border border-white/5 flex flex-col justify-center">
                  <h4 className="font-semibold text-white text-xs">{contact.name}</h4>
                  <p className="text-[10px] text-slate-400">{contact.role}</p>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="text-[10px] text-amber-400 hover:underline mt-1">
                      {contact.email}
                    </a>
                  )}
                </div>
              ))}
              {(!app.contacts || app.contacts.length === 0) && (
                <div className="col-span-2 text-center text-slate-500 text-xs py-4">
                  No recruiter contact details logged.
                </div>
              )}
            </div>
          </div>

          {/* Job Notes */}
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-white text-base">Notes & Description</h3>
            <div className="text-xs text-slate-300 leading-relaxed bg-neutral/20 border border-white/5 rounded-xl p-4 min-h-24 whitespace-pre-wrap">
              {app.notes || 'No custom notes logged. Put descriptions or reminders here.'}
            </div>
          </div>

        </div>

        {/* Right Side: AI Assistant Suites */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-card rounded-2xl p-5 border border-amber-500/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <h3 className="font-bold text-white text-base">AI Career Intelligence</h3>
                <p className="text-[10px] text-slate-400">Gemini-backed decision support engine</p>
              </div>
            </div>

            <div className="tabs tabs-boxed bg-neutral/60 border border-white/5 p-1 rounded-xl grid grid-cols-4 text-[10px] font-semibold">
              <button 
                onClick={() => setActiveAITab('FOLLOWUP')}
                className={`tab tab-xs rounded-lg py-1.5 ${activeAITab === 'FOLLOWUP' ? 'tab-active bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                Follow-Up
              </button>
              <button 
                onClick={() => setActiveAITab('PROBABILITY')}
                className={`tab tab-xs rounded-lg py-1.5 ${activeAITab === 'PROBABILITY' ? 'tab-active bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                Probability
              </button>
              <button 
                onClick={() => setActiveAITab('PREP')}
                className={`tab tab-xs rounded-lg py-1.5 ${activeAITab === 'PREP' ? 'tab-active bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                Prep
              </button>
              <button 
                onClick={() => setActiveAITab('SALARY')}
                className={`tab tab-xs rounded-lg py-1.5 ${activeAITab === 'SALARY' ? 'tab-active bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                Salary
              </button>
            </div>

            <div className="space-y-4 pt-2">
              
              {activeAITab === 'FOLLOWUP' && (
                <div className="space-y-3">
                  <div className="form-control">
                    <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Desired Email Tone</label>
                    <select 
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="select select-sm select-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Friendly">Friendly</option>
                      <option value="Concise">Concise</option>
                      <option value="Confident">Confident</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Additional Context (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. mention project X"
                      value={customInfo}
                      onChange={(e) => setCustomInfo(e.target.value)}
                      className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                    />
                  </div>

                  <button 
                    onClick={handleGenerateFollowUp}
                    className="btn btn-sm btn-primary text-slate-950 font-bold w-full rounded-lg text-xs flex items-center justify-center gap-1.5"
                    disabled={generatingFollowUp}
                  >
                    {generatingFollowUp ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Follow-Up Pitch
                      </>
                    )}
                  </button>

                  {generatedEmail && (
                    <div className="p-3 bg-neutral-900/60 rounded-xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Email Draft</span>
                        <button 
                          onClick={() => handleCopy(generatedEmail.body)}
                          className="btn btn-ghost btn-xs text-amber-400 hover:bg-amber-500/10 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white">Subject: {generatedEmail.subject}</p>
                        <p className="text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                          {generatedEmail.body}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeAITab === 'PROBABILITY' && (
                <div className="space-y-4">
                  {probAnalysis ? (
                    <div className="space-y-4">
                      <div className="text-center py-4 bg-neutral-900/40 rounded-2xl border border-white/5 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Interview Probability</span>
                        <div className="text-4xl font-extrabold text-white flex items-center justify-center gap-1">
                          <span className="text-gradient">{probAnalysis.score}%</span>
                        </div>
                        <p className="text-xs text-slate-300 font-semibold">{probAnalysis.result}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase font-bold text-slate-400">Scoring Factors</h4>
                        <div className="space-y-1.5">
                          {probAnalysis.factors?.map((fact: string, i: number) => (
                            <p 
                              key={i} 
                              className={`text-[10px] leading-relaxed flex items-start gap-1.5 ${fact.startsWith('✓') ? 'text-amber-400' : 'text-orange-400'}`}
                            >
                              {fact}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase font-bold text-slate-400">Recommended Steps</h4>
                        <div className="space-y-1">
                          {probAnalysis.recommendations?.map((rec: string, i: number) => (
                            <p key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                              {rec}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No initial evaluation. Add notes/description to calculate score.
                    </div>
                  )}
                </div>
              )}

              {activeAITab === 'PREP' && (
                <div className="space-y-4">
                  <div className="bg-neutral-900/40 rounded-xl p-3 border border-white/5 space-y-2.5">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <HelpCircle className="w-4 h-4 text-amber-400" /> Expected Interview Questions
                    </h4>
                    <div className="space-y-2 divide-y divide-white/5">
                      {[
                        `Why do you want to join the team?`,
                        `Describe a challenging problem you solved using modern JavaScript.`,
                        `How do you handle state management in complex applications?`
                      ].map((q, i) => (
                        <p key={i} className="text-[10px] text-slate-300 pt-2 leading-relaxed">
                          {i+1}. "{q}"
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="bg-neutral-900/40 rounded-xl p-3 border border-white/5 space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400">Critical Study Topics</h4>
                    <ul className="list-disc list-inside space-y-1.5 text-[10px] text-slate-300">
                      <li>Core JS principles (scopes, closures, promises)</li>
                      <li>REST API Design best practices</li>
                      <li>CSS layout parameters and layout cycles</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeAITab === 'SALARY' && (
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Compare this position's target offer amount of <strong>${app.salary?.max?.toLocaleString() || '90,000'}</strong> against calculated industry rates.
                  </p>

                  <button 
                    onClick={handleBenchmarkSalary}
                    className="btn btn-sm btn-outline border-amber-500/30 text-amber-400 hover:bg-amber-500/10 w-full rounded-lg text-xs"
                    disabled={benchmarkingSalary}
                  >
                    {benchmarkingSalary ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Benchmark Compensation Offer'
                    )}
                  </button>

                  {salaryBenchmarked && (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 bg-neutral-900/60 rounded-xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Market Range:</span>
                          <span className="font-bold text-white">${salaryBenchmarked.marketMin.toLocaleString()} - ${salaryBenchmarked.marketMax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Evaluation:</span>
                          <span className="font-bold text-warning">{salaryBenchmarked.offerEvaluation}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-1.5">
                          <span className="text-slate-400">Counter Target:</span>
                          <span className="font-bold text-amber-400">${salaryBenchmarked.targetSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Acceptable Floor:</span>
                          <span className="font-bold text-slate-300">${salaryBenchmarked.acceptableSalary.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-900/40 rounded-xl border border-white/5 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Negotiation message</span>
                          <button 
                            onClick={() => handleCopy(salaryBenchmarked.negotiationEmail)}
                            className="btn btn-ghost btn-xs text-amber-400 hover:bg-amber-500/10"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-300 whitespace-pre-wrap h-24 overflow-y-auto pl-1 border-l border-white/10 font-sans">
                          {salaryBenchmarked.negotiationEmail}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {app.companyId && (
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-sm">Company Health Audit</h3>
                  <p className="text-[10px] text-slate-400">AI-estimated indices for {app.companyId.name}</p>
                </div>
                <Link 
                  to="/dashboard/companies"
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  Full audit &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-neutral/40 border border-white/5 rounded-xl text-center space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Health Rating</span>
                  <div className="text-2xl font-black text-white">{app.companyId.healthScore || 50}/100</div>
                  <span className="badge badge-warning badge-xs font-bold text-slate-950">Healthy</span>
                </div>
                <div className="p-3 bg-neutral/40 border border-white/5 rounded-xl text-center space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Estimated Layoff Risk</span>
                  <div className="text-2xl font-black text-error">{app.companyId.layoffRisk || 15}%</div>
                  <span className="badge badge-ghost border border-white/10 badge-xs font-bold text-slate-400">Low</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {timelineModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-neutral border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setTimelineModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-white text-base">Log Timeline Activity</h3>
            
            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Event Type</label>
                <select 
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                  className="select select-sm select-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg"
                >
                  <option value="NOTE">Log Note / Call Summary</option>
                  <option value="EMAIL_SENT">Email Sent to Recruiter</option>
                  <option value="EMAIL_RECEIVED">Email Received from Company</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Event Title *</label>
                <input 
                  type="text"
                  placeholder="e.g. Chat with Emily"
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Details (Optional)</label>
                <textarea 
                  placeholder="Summarize outcomes..."
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  className="textarea textarea-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg h-20"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-sm btn-primary text-slate-950 font-bold w-full rounded-lg"
                disabled={addTimelineEventMutation.isPending}
              >
                {addTimelineEventMutation.isPending ? 'Logging event...' : 'Save Log'}
              </button>
            </form>
          </div>
        </div>
      )}

      {contactModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-neutral border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setContactModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-white text-base">Add Recruiter Connection</h3>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Full Name *</label>
                <input 
                  type="text"
                  placeholder="Jane Smith"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Title / Role</label>
                <input 
                  type="text"
                  placeholder="e.g. Lead Talent Scout"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg"
                />
              </div>

              <div className="form-control">
                <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Email Address</label>
                <input 
                  type="email"
                  placeholder="jane.s@company.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white text-xs rounded-lg"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-sm btn-primary text-slate-950 font-bold w-full rounded-lg"
                disabled={addContactMutation.isPending}
              >
                {addContactMutation.isPending ? 'Saving...' : 'Add Connection'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApplicationDetails;
