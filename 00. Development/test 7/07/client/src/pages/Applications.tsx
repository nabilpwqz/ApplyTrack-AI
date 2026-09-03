import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsAPI } from '../services/api.ts';
import { Application, ApplicationStatus } from '../types/index.ts';
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  X, 
  DollarSign, 
  MapPin, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const KANBAN_STAGES: { id: ApplicationStatus; title: string }[] = [
  { id: 'SAVED', title: 'Saved' },
  { id: 'APPLIED', title: 'Applied' },
  { id: 'SCREENING', title: 'Screening' },
  { id: 'ASSESSMENT', title: 'Assessment' },
  { id: 'INTERVIEW', title: 'Interview Loop' },
  { id: 'FINAL_INTERVIEW', title: 'Final Interview' },
  { id: 'OFFER', title: 'Offer Received' },
  { id: 'ACCEPTED', title: 'Accepted' },
  { id: 'REJECTED', title: 'Rejected' },
  { id: 'GHOSTED', title: 'Ghosted' },
];

export const Applications: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New Application form state
  const [jobTitle, setJobTitle] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [location, setLocation] = useState<string>('');
  const [workMode, setWorkMode] = useState<string>('REMOTE');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [source, setSource] = useState<string>('LinkedIn');
  const [notes, setNotes] = useState<string>('');

  // 1. Fetch Applications List
  const { data: appsData, isLoading } = useQuery({
    queryKey: ['applicationsList', selectedStatus, searchQuery],
    queryFn: () => applicationsAPI.getAll({ status: selectedStatus, search: searchQuery }),
  });

  // Mutate: Update Application Stage
  const updateStageMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: ApplicationStatus }) =>
      applicationsAPI.update(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationsList'] });
      toast.success('Stage updated successfully!');
    },
  });

  // Mutate: Create Application
  const createMutation = useMutation({
    mutationFn: (newAppData: any) => applicationsAPI.create(newAppData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationsList'] });
      toast.success('Application created!');
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setJobTitle('');
    setCompanyName('');
    setStatus('APPLIED');
    setPriority('MEDIUM');
    setLocation('');
    setWorkMode('REMOTE');
    setSalaryMin('');
    setSalaryMax('');
    setSource('LinkedIn');
    setNotes('');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const appId = active.id as string;
    const newStage = over.id as ApplicationStatus;

    const app = apps.find(a => a._id === appId);
    if (app && app.status !== newStage) {
      updateStageMutation.mutate({ id: appId, newStatus: newStage });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !companyName) {
      return toast.error('Job Title and Company Name are required');
    }

    createMutation.mutate({
      jobTitle,
      companyName,
      status,
      priority,
      location,
      workMode,
      salary: {
        min: salaryMin ? Number(salaryMin) : undefined,
        max: salaryMax ? Number(salaryMax) : undefined,
        currency: 'USD',
      },
      source,
      notes,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
        <span className="loading loading-spinner loading-lg text-amber-500"></span>
        <p className="text-slate-400 text-sm font-medium">Loading application matrix...</p>
      </div>
    );
  }

  const apps: Application[] = appsData?.data || [];

  const getStatusBadge = (st: ApplicationStatus) => {
    switch (st) {
      case 'SAVED': return 'badge-neutral text-slate-300';
      case 'APPLIED': return 'badge-primary text-slate-950 font-bold';
      case 'SCREENING': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold';
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
      
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Applications Command Board</h1>
          <p className="text-xs text-slate-400">Manage pipeline stages via drag-and-drop or table layout</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="join border border-white/10 bg-neutral-900/60 p-0.5 rounded-xl">
            <button 
              onClick={() => setViewMode('KANBAN')}
              className={`join-item btn btn-xs border-none rounded-lg text-xs flex items-center gap-1 ${viewMode === 'KANBAN' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button 
              onClick={() => setViewMode('TABLE')}
              className={`join-item btn btn-xs border-none rounded-lg text-xs flex items-center gap-1 ${viewMode === 'TABLE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-sm btn-primary text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-900/40 p-3 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm w-full pl-9 bg-neutral-950 border-white/5 text-white text-xs rounded-xl focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Stage Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scroll text-xs">
          <button 
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${selectedStatus === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-neutral-800/60 text-slate-400 hover:text-white'}`}
          >
            All Stages ({apps.length})
          </button>
          {KANBAN_STAGES.map((stage) => {
            const count = apps.filter(a => a.status === stage.id).length;
            if (count === 0 && selectedStatus !== stage.id) return null;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStatus(stage.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${selectedStatus === stage.id ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-neutral-800/60 text-slate-400 hover:text-white'}`}
              >
                <span>{stage.title}</span>
                <span className="badge badge-ghost badge-xs text-[9px] px-1 font-bold">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'KANBAN' ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6 custom-scroll min-h-[600px]">
            {KANBAN_STAGES.map((stage) => {
              const stageApps = apps.filter(a => a.status === stage.id);
              
              return (
                <div 
                  key={stage.id}
                  id={stage.id}
                  className="w-72 flex-shrink-0 bg-neutral-900/30 border border-white/5 rounded-2xl p-3 flex flex-col justify-between space-y-3"
                >
                  <div className="flex justify-between items-center px-1 pb-2 border-b border-white/5">
                    <span className="font-bold text-white text-xs tracking-wide">{stage.title}</span>
                    <span className="badge badge-warning badge-xs font-bold text-slate-950 px-1.5 py-0.5 rounded">
                      {stageApps.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[65vh] custom-scroll pr-1">
                    {stageApps.map((app) => (
                      <div
                        key={app._id}
                        onClick={() => navigate(`/dashboard/applications/${app._id}`)}
                        className="p-4 bg-neutral-900/70 border border-white/5 hover:border-amber-500/40 rounded-xl space-y-2 cursor-pointer transition-all hover:scale-[1.01] shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white text-xs leading-snug line-clamp-1">{app.jobTitle}</h4>
                          <span className="text-[9px] bg-neutral/80 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase">
                            {app.priority}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 font-semibold truncate">
                          {app.companyId?.name || app.companyName || 'Company'}
                        </p>

                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-white/5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" /> {app.location || 'Remote'}
                          </span>
                          <span className="font-bold text-amber-400">
                            {app.salary?.max ? `$${app.salary.max.toLocaleString()}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}

                    {stageApps.length === 0 && (
                      <div className="text-center py-10 border border-dashed border-white/5 rounded-xl text-[10px] text-slate-600">
                        Drop items here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      ) : (
        /* List Table View */
        <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="table w-full text-slate-300 text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th>Job Title & Company</th>
                  <th>Stage</th>
                  <th>Priority</th>
                  <th>Location</th>
                  <th>Applied Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {apps.map((app) => (
                  <tr key={app._id} className="hover:bg-neutral-900/40">
                    <td>
                      <div>
                        <Link to={`/dashboard/applications/${app._id}`} className="font-bold text-white hover:text-amber-400">
                          {app.jobTitle}
                        </Link>
                        <p className="text-[10px] text-slate-400">{app.companyId?.name || app.companyName}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(app.status)} badge-xs font-bold uppercase`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        {app.priority}
                      </span>
                    </td>
                    <td>{app.location || 'Remote'}</td>
                    <td>{new Date(app.applicationDate).toLocaleDateString()}</td>
                    <td className="text-right">
                      <Link 
                        to={`/dashboard/applications/${app._id}`}
                        className="btn btn-xs btn-ghost text-amber-400 hover:bg-amber-500/10"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Application */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-white text-base">Track New Job Application</h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Job Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. React Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-950 border-white/5 text-white text-xs rounded-lg"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Company Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. OpenAI"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-950 border-white/5 text-white text-xs rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Current Stage</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="select select-sm select-bordered bg-neutral-950 border-white/5 text-white text-xs rounded-lg"
                  >
                    {KANBAN_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="select select-sm select-bordered bg-neutral-950 border-white/5 text-white text-xs rounded-lg"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Austin, TX"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-950 border-white/5 text-white text-xs rounded-lg"
                  />
                </div>
                <div className="form-control">
                  <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Target Salary ($)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 110000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-950 border-white/5 text-white text-xs rounded-lg"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="btn btn-sm btn-primary text-slate-950 font-bold w-full rounded-xl"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Logging Application...' : 'Save Job Dossier'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Applications;
