import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '../services/api.js';
import { DndContext, useDroppable, useDraggable } from '@dnd-kit/core';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Table, 
  Kanban, 
  Briefcase, 
  AlertCircle,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

// ----------------------------------------------------
// KANBAN COMPONENT DND-KIT HELPERS
// ----------------------------------------------------
function DraggableCard({ app, getStatusBadge }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app._id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="p-4 bg-neutral/60 border border-white/5 rounded-xl space-y-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors"
      {...listeners}
      {...attributes}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-white text-sm truncate max-w-[150px]">{app.jobTitle}</h4>
        <span className={`badge ${getStatusBadge(app.status)} badge-xs uppercase font-semibold`}>
          {app.status}
        </span>
      </div>
      <p className="text-xs text-slate-400 font-medium">
        {app.companyId ? app.companyId.name : 'Unknown Company'}
      </p>
      
      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-medium">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {app.location || 'Remote'}
        </span>
        <span>
          {new Date(app.applicationDate).toLocaleDateString()}
        </span>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-white/5">
        <span className="text-[10px] bg-neutral-900 px-2 py-0.5 rounded text-slate-400 uppercase font-bold">
          {app.priority} Priority
        </span>
        <Link 
          to={`/dashboard/applications/${app._id}`}
          className="text-xs text-primary font-bold hover:underline"
          onMouseDown={(e) => e.stopPropagation()} // Stop DND click event hijacks
        >
          Details &rarr;
        </Link>
      </div>
    </div>
  );
}

function DroppableColumn({ id, title, apps, getStatusBadge }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const style = {
    backgroundColor: isOver ? 'rgba(99, 102, 241, 0.05)' : undefined,
    borderColor: isOver ? 'rgba(99, 102, 241, 0.2)' : undefined,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex-1 min-w-[280px] bg-neutral/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 min-h-[500px]"
    >
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="font-bold text-white text-sm tracking-wide">{title}</h3>
        <span className="bg-neutral text-slate-400 font-bold text-xs px-2.5 py-0.5 rounded-full">
          {apps.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-1">
        {apps.map((app) => (
          <DraggableCard key={app._id} app={app} getStatusBadge={getStatusBadge} />
        ))}
        {apps.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-xs py-8">
            Empty Stage
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// MAIN APPLICATIONS PAGE COMPONENT
// ----------------------------------------------------
export const Applications = () => {
  const queryClient = useQueryClient();

  // Page layout toggles
  const [viewMode, setViewMode] = useState('KANBAN'); // KANBAN or TABLE
  const [modalOpen, setModalOpen] = useState(false);

  // Filters & sorting states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  // New Application inputs states
  const [newAppName, setNewAppName] = useState('');
  const [newAppRole, setNewAppRole] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppLoc, setNewAppLoc] = useState('');
  const [newAppMode, setNewAppMode] = useState('REMOTE');
  const [newAppType, setNewAppType] = useState('FULL_TIME');
  const [newAppPriority, setNewAppPriority] = useState('MEDIUM');
  const [newAppStatus, setNewAppStatus] = useState('APPLIED');
  const [newAppMinSalary, setNewAppMinSalary] = useState('');
  const [newAppMaxSalary, setNewAppMaxSalary] = useState('');
  const [newAppNotes, setNewAppNotes] = useState('');
  const [newAppTags, setNewAppTags] = useState('');
  const [newAppContactName, setNewAppContactName] = useState('');
  const [newAppContactEmail, setNewAppContactEmail] = useState('');

  // 1. Fetch User Applications
  const { data: appsData, isLoading } = useQuery({
    queryKey: ['applicationsList', { status: statusFilter, priority: priorityFilter, search, sort: sortBy }],
    queryFn: () => applicationsAPI.getAll({
      status: statusFilter,
      priority: priorityFilter,
      search: search,
      sort: sortBy
    }),
  });

  // 2. Drag & Drop Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => applicationsAPI.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['applicationsList']);
      queryClient.invalidateQueries(['analyticsSummary']);
    },
    onError: (err) => {
      toast.error('Failed to move application status: ' + err.message);
    }
  });

  // 3. Create Application Mutation
  const createMutation = useMutation({
    mutationFn: applicationsAPI.create,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Application logged and initial AI match rate generated!');
        setModalOpen(false);
        // reset form
        setNewAppName('');
        setNewAppRole('');
        setNewAppUrl('');
        setNewAppLoc('');
        setNewAppNotes('');
        setNewAppTags('');
        setNewAppContactName('');
        setNewAppContactEmail('');
        setNewAppMinSalary('');
        setNewAppMaxSalary('');
        
        queryClient.invalidateQueries(['applicationsList']);
        queryClient.invalidateQueries(['analyticsSummary']);
        queryClient.invalidateQueries(['allApplications']);
      }
    },
    onError: (err) => {
      toast.error('Failed to create application: ' + err.message);
    }
  });

  // Handle Drag End event from dnd-kit
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const applicationId = active.id;
    const destinationStatus = over.id; // columnId matches status enum

    const targetApp = appsData?.data?.find(a => a._id === applicationId);
    if (targetApp && targetApp.status !== destinationStatus) {
      // Trigger update API call
      updateStatusMutation.mutate({ id: applicationId, status: destinationStatus });
      toast.success(`Moved application to ${destinationStatus}`);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newAppName || !newAppRole) {
      return toast.error('Company Name and Job Title are required');
    }

    createMutation.mutate({
      companyName: newAppName,
      jobTitle: newAppRole,
      jobUrl: newAppUrl,
      location: newAppLoc,
      workMode: newAppMode,
      employmentType: newAppType,
      priority: newAppPriority,
      status: newAppStatus,
      salary: {
        min: Number(newAppMinSalary) || 0,
        max: Number(newAppMaxSalary) || 0,
        currency: 'USD',
      },
      notes: newAppNotes,
      tags: newAppTags ? newAppTags.split(',').map(t => t.trim()) : [],
      contacts: newAppContactName ? [{
        name: newAppContactName,
        email: newAppContactEmail,
        role: 'Recruiter'
      }] : [],
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SAVED': return 'badge-neutral';
      case 'APPLIED': return 'badge-primary';
      case 'SCREENING': return 'badge-info';
      case 'ASSESSMENT': return 'badge-warning';
      case 'INTERVIEW':
      case 'FINAL_INTERVIEW': return 'badge-secondary';
      case 'OFFER': return 'badge-success text-white font-semibold';
      case 'ACCEPTED': return 'badge-success text-white';
      case 'REJECTED': return 'badge-error';
      case 'GHOSTED': return 'badge-ghost border border-white/10';
      default: return 'badge-neutral';
    }
  };

  const appsList = appsData?.data || [];

  // Group applications into columns for Kanban view
  const columns = {
    'SAVED': appsList.filter(a => a.status === 'SAVED'),
    'APPLIED': appsList.filter(a => a.status === 'APPLIED'),
    'SCREENING': appsList.filter(a => a.status === 'SCREENING'),
    'INTERVIEW': appsList.filter(a => ['INTERVIEW', 'FINAL_INTERVIEW'].includes(a.status)),
    'OFFER': appsList.filter(a => a.status === 'OFFER'),
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Applications Tracking</h1>
          <p className="text-xs text-slate-400">Manage, sort, and organize your pipeline stages</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="join bg-neutral/40 border border-white/5 rounded-xl overflow-hidden p-0.5">
            <button 
              onClick={() => setViewMode('KANBAN')}
              className={`btn btn-xs rounded-lg join-item ${viewMode === 'KANBAN' ? 'btn-primary' : 'btn-ghost text-slate-400'}`}
            >
              <Kanban className="w-3.5 h-3.5 mr-1" />
              Kanban
            </button>
            <button 
              onClick={() => setViewMode('TABLE')}
              className={`btn btn-xs rounded-lg join-item ${viewMode === 'TABLE' ? 'btn-primary' : 'btn-ghost text-slate-400'}`}
            >
              <Table className="w-3.5 h-3.5 mr-1" />
              Table
            </button>
          </div>

          <button 
            onClick={() => setModalOpen(true)}
            className="btn btn-sm btn-primary rounded-xl flex items-center gap-1.5 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Add Job
          </button>
        </div>
      </div>

      {/* Filter / Search Panel */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-white/5">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-sm input-bordered w-full pl-10 bg-neutral/20 border-white/5 text-white rounded-lg focus:outline-none focus:border-primary text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-sm select-bordered bg-neutral/20 border-white/5 text-white rounded-lg text-xs"
            >
              <option value="ALL">All Stages</option>
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="SCREENING">Screening</option>
              <option value="ASSESSMENT">Assessment</option>
              <option value="INTERVIEW">Interview Loop</option>
              <option value="OFFER">Offers</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="GHOSTED">Ghosted</option>
            </select>
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="select select-sm select-bordered bg-neutral/20 border-white/5 text-white rounded-lg text-xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Sorter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select select-sm select-bordered bg-neutral/20 border-white/5 text-white rounded-lg text-xs"
          >
            <option value="NEWEST">Newest Applied</option>
            <option value="OLDEST">Oldest Applied</option>
            <option value="HIGHEST_SALARY">Highest Salary</option>
            <option value="UPCOMING_DEADLINE">Upcoming Deadline</option>
            <option value="NEXT_FOLLOWUP">Next Follow-Up</option>
          </select>
        </div>
      </div>

      {/* Main Board view */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-[50vh] gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-slate-400 text-sm">Organizing your records...</p>
        </div>
      ) : viewMode === 'KANBAN' ? (
        /* Kanban View (DnD Context) */
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex flex-wrap lg:flex-nowrap gap-4 overflow-x-auto pb-4">
            <DroppableColumn id="SAVED" title="Saved" apps={columns.SAVED} getStatusBadge={getStatusBadge} />
            <DroppableColumn id="APPLIED" title="Applied" apps={columns.APPLIED} getStatusBadge={getStatusBadge} />
            <DroppableColumn id="SCREENING" title="Screening" apps={columns.SCREENING} getStatusBadge={getStatusBadge} />
            <DroppableColumn id="INTERVIEW" title="Interview Loop" apps={columns.INTERVIEW} getStatusBadge={getStatusBadge} />
            <DroppableColumn id="OFFER" title="Offer" apps={columns.OFFER} getStatusBadge={getStatusBadge} />
          </div>
        </DndContext>
      ) : (
        /* Table View */
        <div className="glass-card rounded-2xl overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="table w-full text-slate-300">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs">
                  <th>Company</th>
                  <th>Position</th>
                  <th>Stage</th>
                  <th>Priority</th>
                  <th>Applied</th>
                  <th>Next Action</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appsList.map((app) => (
                  <tr key={app._id} className="hover:bg-neutral/20 border-none transition-colors">
                    <td className="font-semibold text-white">
                      {app.companyId ? app.companyId.name : 'Unknown'}
                    </td>
                    <td>{app.jobTitle}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(app.status)} badge-sm`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-slate-400">
                        {app.priority}
                      </span>
                    </td>
                    <td className="text-xs">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="text-xs text-slate-400">
                      {app.nextFollowUpAt ? (
                        <span className="flex items-center gap-1 text-warning">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(app.nextFollowUpAt).toLocaleDateString()}
                        </span>
                      ) : (
                        'None scheduled'
                      )}
                    </td>
                    <td className="text-right">
                      <Link 
                        to={`/dashboard/applications/${app._id}`}
                        className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 rounded"
                      >
                        Edit / View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
                {appsList.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-500 text-sm">
                      No applications match the current filter set.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000]/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-neutral border border-white/10 rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Track New Application</h3>
              <p className="text-xs text-slate-400">Save job posting and trigger initial matching analyses</p>
            </div>

            <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg focus:outline-none text-xs"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs">Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Dev"
                  value={newAppRole}
                  onChange={(e) => setNewAppRole(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg focus:outline-none text-xs"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs">Job URL</label>
                <input
                  type="url"
                  placeholder="https://company.com/jobs/..."
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg focus:outline-none text-xs"
                />
              </div>

              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs">Location</label>
                <input
                  type="text"
                  placeholder="Austin, TX"
                  value={newAppLoc}
                  onChange={(e) => setNewAppLoc(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg focus:outline-none text-xs"
                />
              </div>

              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs">Work Mode</label>
                <select
                  value={newAppMode}
                  onChange={(e) => setNewAppMode(e.target.value)}
                  className="select select-sm select-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                >
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ON_SITE">On-Site</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs">Employment Type</label>
                <select
                  value={newAppType}
                  onChange={(e) => setNewAppType(e.target.value)}
                  className="select select-sm select-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs">Priority</label>
                <select
                  value={newAppPriority}
                  onChange={(e) => setNewAppPriority(e.target.value)}
                  className="select select-sm select-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs">Initial Status</label>
                <select
                  value={newAppStatus}
                  onChange={(e) => setNewAppStatus(e.target.value)}
                  className="select select-sm select-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                >
                  <option value="SAVED">Saved</option>
                  <option value="APPLIED">Applied</option>
                  <option value="SCREENING">Screening</option>
                  <option value="ASSESSMENT">Assessment</option>
                  <option value="INTERVIEW">Interview Loop</option>
                </select>
              </div>

              <div className="form-control grid grid-cols-2 gap-2 md:col-span-2">
                <div>
                  <label className="label py-1 text-slate-400 text-xs">Min Salary ($)</label>
                  <input
                    type="number"
                    placeholder="80000"
                    value={newAppMinSalary}
                    onChange={(e) => setNewAppMinSalary(e.target.value)}
                    className="input input-sm input-bordered w-full bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="label py-1 text-slate-400 text-xs">Max Salary ($)</label>
                  <input
                    type="number"
                    placeholder="120000"
                    value={newAppMaxSalary}
                    onChange={(e) => setNewAppMaxSalary(e.target.value)}
                    className="input input-sm input-bordered w-full bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="form-control md:col-span-2">
                <label className="label py-1 text-slate-400 text-xs">Job Notes & JD Details (Helps AI evaluation)</label>
                <textarea
                  placeholder="Paste details, key keywords, or notes here..."
                  value={newAppNotes}
                  onChange={(e) => setNewAppNotes(e.target.value)}
                  className="textarea textarea-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs h-20"
                ></textarea>
              </div>

              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs">Contacts (Recruiter Name)</label>
                <input
                  type="text"
                  placeholder="Sarah J."
                  value={newAppContactName}
                  onChange={(e) => setNewAppContactName(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                />
              </div>

              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs">Contacts (Recruiter Email)</label>
                <input
                  type="email"
                  placeholder="recruiter@email.com"
                  value={newAppContactEmail}
                  onChange={(e) => setNewAppContactEmail(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label py-1 text-slate-400 text-xs">Tags (comma-separated, e.g. React, Node)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Remote"
                  value={newAppTags}
                  onChange={(e) => setNewAppTags(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-4 md:col-span-2">
                <button 
                  type="submit" 
                  className="btn btn-sm btn-primary rounded-xl flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? <span className="loading loading-spinner loading-xs"></span> : 'Save Application'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="btn btn-sm btn-outline rounded-xl"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Applications;
