import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsAPI } from '../services/api.ts';
import { Application } from '../types/index.ts';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  GripVertical,
  ChevronRight,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

// Sortable Kanban Card item
interface KanbanCardProps {
  app: Application;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ app }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'HIGH': return 'border-orange-500/40 text-orange-400 bg-orange-500/10';
      case 'MEDIUM': return 'border-amber-500/40 text-amber-400 bg-amber-500/10';
      case 'LOW': return 'border-slate-500/40 text-slate-400 bg-slate-500/10';
      default: return 'border-slate-500/40 text-slate-400';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-neutral-900/50 rounded-xl border border-white/5 space-y-3 shadow-lg hover:border-amber-500/40 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getPriorityBadge(app.priority)}`}>
            {app.priority}
          </span>
          <h4 className="font-bold text-white text-sm truncate pt-1.5 group-hover:text-amber-400 transition-colors">
            {app.jobTitle}
          </h4>
          <p className="text-xs text-slate-400 font-medium truncate">
            {app.companyId ? app.companyId.name : app.companyName || 'Company'}
          </p>
        </div>
        <button 
          {...attributes} 
          {...listeners}
          className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing p-1"
          title="Drag to change stage"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5">
        <span>{app.location || 'Remote'}</span>
        <Link 
          to={`/dashboard/applications/${app._id}`}
          className="text-amber-400 font-semibold hover:underline flex items-center gap-0.5"
        >
          View <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export const Applications: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // New application form states
  const [jobTitle, setJobTitle] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [workMode, setWorkMode] = useState<'REMOTE' | 'HYBRID' | 'ON_SITE'>('REMOTE');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [source, setSource] = useState<string>('LinkedIn');
  const [notes, setNotes] = useState<string>('');

  // Fetch applications list
  const { data: appsData, isLoading } = useQuery({
    queryKey: ['applicationsList'],
    queryFn: () => applicationsAPI.getAll(),
  });

  // Mutate: Update stage/status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => applicationsAPI.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationsList'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
      toast.success('Updated application stage');
    },
  });

  // Mutate: Create application
  const createMutation = useMutation({
    mutationFn: (newAppData: any) => applicationsAPI.create(newAppData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationsList'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
      toast.success('Application created!');
      setModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setJobTitle('');
    setCompanyName('');
    setSalaryMin('');
    setSalaryMax('');
    setLocation('');
    setNotes('');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <span className="loading loading-spinner loading-lg text-amber-500"></span>
        <p className="text-slate-400 text-sm">Loading applications pipeline...</p>
      </div>
    );
  }

  const allApps: Application[] = appsData?.data || [];

  // Filter applications
  const filteredApps = allApps.filter((app) => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.companyId?.name || app.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Kanban Columns configuration
  const kanbanColumns = [
    { id: 'SAVED', title: 'Saved Jobs', color: 'border-slate-500' },
    { id: 'APPLIED', title: 'Applied', color: 'border-amber-500' },
    { id: 'SCREENING', title: 'Screening', color: 'border-amber-600' },
    { id: 'ASSESSMENT', title: 'Assessment', color: 'border-orange-500' },
    { id: 'INTERVIEW', title: 'Interview Loop', color: 'border-amber-400' },
    { id: 'OFFER', title: 'Offer Received', color: 'border-yellow-400' },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const draggedApp = allApps.find(a => a._id === activeId);
    if (!draggedApp) return;

    // Determine target status column
    let newStatus = overId;
    if (!kanbanColumns.some(col => col.id === overId)) {
      const overApp = allApps.find(a => a._id === overId);
      if (overApp) newStatus = overApp.status;
    }

    if (draggedApp.status !== newStatus && kanbanColumns.some(col => col.id === newStatus)) {
      updateStatusMutation.mutate({ id: activeId, status: newStatus });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !companyName) {
      return toast.error('Job Title and Company Name are required');
    }

    createMutation.mutate({
      jobTitle,
      companyName,
      status: 'APPLIED',
      priority,
      workMode,
      location: location || 'Remote',
      source,
      notes,
      salary: {
        min: salaryMin ? Number(salaryMin) : undefined,
        max: salaryMax ? Number(salaryMax) : undefined,
        currency: 'USD',
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Applications Command Board</h1>
          <p className="text-xs text-slate-400">Drag and drop cards across columns to update pipeline stage</p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="btn btn-primary text-slate-950 font-bold rounded-xl flex items-center gap-2 text-xs shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Log Application
        </button>
      </div>

      {/* Filter and View Toggles */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-neutral/20 border border-white/5 rounded-2xl p-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search company or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm input-bordered bg-neutral/50 border-white/5 pl-9 text-xs text-white rounded-xl focus:outline-none focus:border-amber-500 w-full"
            />
          </div>

          {/* Status Select */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-sm select-bordered bg-neutral/50 border-white/5 text-xs text-white rounded-xl focus:outline-none"
          >
            <option value="ALL">All Stages</option>
            <option value="SAVED">Saved</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="ASSESSMENT">Assessment</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
            <option value="GHOSTED">Ghosted</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="join bg-neutral/50 border border-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('KANBAN')}
            className={`btn btn-xs join-item rounded-lg ${viewMode === 'KANBAN' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Kanban
          </button>
          <button 
            onClick={() => setViewMode('TABLE')}
            className={`btn btn-xs join-item rounded-lg ${viewMode === 'TABLE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            <List className="w-3.5 h-3.5" /> Table
          </button>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'KANBAN' && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {kanbanColumns.map((col) => {
              const colApps = filteredApps.filter(a => a.status === col.id || (col.id === 'INTERVIEW' && a.status === 'FINAL_INTERVIEW'));
              
              return (
                <div key={col.id} className="glass-panel rounded-2xl p-3 space-y-3 border-t-2 border border-white/5 flex flex-col justify-start min-w-64">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h3 className="font-bold text-white text-xs">{col.title}</h3>
                    <span className="badge badge-neutral badge-xs font-bold text-slate-400">
                      {colApps.length}
                    </span>
                  </div>

                  <SortableContext items={colApps.map(a => a._id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 min-h-48">
                      {colApps.map((app) => (
                        <KanbanCard key={app._id} app={app} />
                      ))}
                      {colApps.length === 0 && (
                        <div className="h-32 border border-dashed border-white/5 rounded-xl flex items-center justify-center text-[10px] text-slate-600">
                          Drop cards here
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        </DndContext>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'TABLE' && (
        <div className="glass-card rounded-2xl p-6 overflow-x-auto border-white/5">
          <table className="table w-full text-slate-300">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs">
                <th>Company</th>
                <th>Role</th>
                <th>Priority</th>
                <th>Stage</th>
                <th>Salary Range</th>
                <th>Applied Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredApps.map((app) => (
                <tr key={app._id} className="hover:bg-neutral/20 border-none">
                  <td className="font-semibold text-white">
                    {app.companyId ? app.companyId.name : app.companyName}
                  </td>
                  <td>{app.jobTitle}</td>
                  <td>
                    <span className="badge badge-outline badge-xs font-semibold">
                      {app.priority}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-primary badge-xs font-bold">
                      {app.status}
                    </span>
                  </td>
                  <td>
                    {app.salary?.min ? `$${app.salary.min.toLocaleString()} - $${app.salary.max?.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="text-slate-400">
                    {new Date(app.applicationDate).toLocaleDateString()}
                  </td>
                  <td className="text-right">
                    <Link to={`/dashboard/applications/${app._id}`} className="btn btn-ghost btn-xs text-amber-400">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Application Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000]/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-neutral border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-bold text-white text-lg">Log New Job Application</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs text-slate-400">Job Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Frontend Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs text-slate-400">Company Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs text-slate-400">Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Remote / Austin, TX"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs text-slate-400">Work Mode</label>
                  <select 
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as any)}
                    className="select select-sm select-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs text-slate-400">Salary Min ($)</label>
                  <input 
                    type="number" 
                    placeholder="80000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs text-slate-400">Salary Max ($)</label>
                  <input 
                    type="number" 
                    placeholder="120000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs text-slate-400">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="select select-sm select-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label text-xs text-slate-400">Source</label>
                  <input 
                    type="text" 
                    placeholder="LinkedIn, Referral, etc."
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label text-xs text-slate-400">Notes / Details</label>
                <textarea 
                  placeholder="Paste job posting details or interview notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="textarea textarea-bordered bg-neutral-900 border-white/10 text-white text-xs rounded-lg h-20"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-sm btn-primary text-slate-950 font-bold w-full rounded-xl"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Logging application...' : 'Save Application'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Applications;
