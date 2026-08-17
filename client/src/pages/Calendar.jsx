import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { interviewsAPI, remindersAPI, applicationsAPI } from '../services/api.js';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch Interviews
  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: ['calendarInterviews'],
    queryFn: interviewsAPI.getAll,
  });

  // Fetch Reminders
  const { data: remindersData, isLoading: remindersLoading } = useQuery({
    queryKey: ['calendarReminders'],
    queryFn: () => remindersAPI.getAll(),
  });

  // Fetch Applications (for deadline tracking)
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['calendarApps'],
    queryFn: () => applicationsAPI.getAll(),
  });

  if (interviewsLoading || remindersLoading || appsLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-slate-400 text-sm">Synchronizing schedule events...</p>
      </div>
    );
  }

  const interviews = interviewsData?.data || [];
  const reminders = remindersData?.data || [];
  const apps = appsData?.data || [];

  // Calendar Math helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // First day of current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Create grid cells
  const dayCells = [];
  
  // Fill preceding offsets (blank cells)
  // Adjusting firstDayIndex for Mon-Sun calendar flow
  // (0 is Sunday, 1 is Monday... firstDayIndex is index where 1st of month lands)
  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(null);
  }

  // Fill month dates
  for (let d = 1; d <= totalDays; d++) {
    dayCells.push(new Date(year, month, d));
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Maps events occurring on a specific date
  const getEventsForDate = (date) => {
    if (!date) return [];
    const cellEvents = [];
    const dateStr = date.toDateString();

    // 1. Check Interviews
    interviews.forEach((interview) => {
      if (new Date(interview.scheduledAt).toDateString() === dateStr) {
        cellEvents.push({
          id: interview._id,
          type: 'INTERVIEW',
          title: `${interview.applicationId?.companyId?.name || 'Company'} Interview`,
          time: new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: 'bg-secondary/20 text-secondary border-secondary/30',
          path: `/dashboard/applications/${interview.applicationId?._id}`,
        });
      }
    });

    // 2. Check Reminders
    reminders.forEach((reminder) => {
      if (!reminder.completed && new Date(reminder.dueAt).toDateString() === dateStr) {
        cellEvents.push({
          id: reminder._id,
          type: 'REMINDER',
          title: reminder.title,
          time: new Date(reminder.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: 'bg-warning/20 text-warning border-warning/30',
          path: `/dashboard/applications/${reminder.applicationId?._id}`,
        });
      }
    });

    // 3. Check App Deadlines
    apps.forEach((app) => {
      if (app.deadline && new Date(app.deadline).toDateString() === dateStr) {
        cellEvents.push({
          id: app._id,
          type: 'DEADLINE',
          title: `${app.companyId?.name || 'Company'} Deadline`,
          color: 'bg-error/20 text-error border-error/30',
          path: `/dashboard/applications/${app._id}`,
        });
      }
    });

    return cellEvents;
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Header Navs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Calendar Workspace</h1>
          <p className="text-xs text-slate-400">Track deadlines, recruitment calls, and assessment tasks</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-neutral/40 border border-white/5 rounded-xl p-1">
            <button onClick={prevMonth} className="btn btn-ghost btn-xs text-slate-300 hover:text-white rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-3 min-w-32 text-center">
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="btn btn-ghost btn-xs text-slate-300 hover:text-white rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())} 
            className="btn btn-sm btn-outline border-white/10 text-slate-300 hover:bg-white/5 rounded-xl text-xs"
          >
            Today
          </button>
        </div>
      </div>

      {/* Grid Sheet */}
      <div className="glass-card rounded-2xl p-4 overflow-hidden border-white/5">
        
        {/* Week Days Label */}
        <div className="grid grid-cols-7 gap-2 pb-2 text-center border-b border-white/5">
          {weekdays.map((day) => (
            <span key={day} className="text-xs font-bold text-slate-500 uppercase tracking-wider py-1.5">
              {day}
            </span>
          ))}
        </div>

        {/* Days grid slots */}
        <div className="grid grid-cols-7 gap-2 pt-3">
          {dayCells.map((dateVal, idx) => {
            const cellEvents = getEventsForDate(dateVal);
            const isToday = dateVal && dateVal.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={idx} 
                className={`
                  min-h-24 md:min-h-28 rounded-xl p-2 flex flex-col justify-between border transition-all duration-200
                  ${dateVal ? 'bg-neutral/20 border-white/5' : 'bg-transparent border-transparent'}
                  ${isToday ? 'border-primary/50 shadow-lg shadow-primary/5 bg-primary/5' : ''}
                `}
              >
                {dateVal ? (
                  <>
                    {/* Date label */}
                    <div className="flex justify-between items-center mb-1">
                      <span className={`
                        text-xs font-bold px-1.5 py-0.5 rounded
                        ${isToday ? 'bg-primary text-white' : 'text-slate-400'}
                      `}>
                        {dateVal.getDate()}
                      </span>
                    </div>

                    {/* Cell Events list */}
                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[14vh] custom-scroll">
                      {cellEvents.map((ev) => (
                        <Link 
                          key={ev.id}
                          to={ev.path}
                          className={`
                            block text-[9px] font-bold py-0.5 px-1.5 border rounded leading-tight truncate hover:scale-[1.01] transition-transform
                            ${ev.color}
                          `}
                          title={`${ev.title} ${ev.time ? `(${ev.time})` : ''}`}
                        >
                          {ev.title}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>

      </div>

      {/* Legend identifiers */}
      <div className="flex flex-wrap items-center gap-6 justify-center text-[10px] text-slate-400 bg-neutral/10 py-3 rounded-2xl border border-white/5">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-secondary/20 border border-secondary/30"></span>
          Recruiter Interviews
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-warning/20 border border-warning/30"></span>
          Due Reminders
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-error/20 border border-error/30"></span>
          Application Deadlines
        </span>
      </div>

    </div>
  );
};
export default Calendar;
