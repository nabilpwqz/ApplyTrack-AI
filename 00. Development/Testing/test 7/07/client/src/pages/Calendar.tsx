import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { interviewsAPI, remindersAPI, applicationsAPI } from '../services/api.ts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Application, Interview, Reminder } from '../types/index.ts';

interface CalendarEvent {
  id: string;
  type: string;
  title: string;
  time?: string;
  color: string;
  path: string;
}

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: ['calendarInterviews'],
    queryFn: interviewsAPI.getAll,
  });

  const { data: remindersData, isLoading: remindersLoading } = useQuery({
    queryKey: ['calendarReminders'],
    queryFn: () => remindersAPI.getAll(),
  });

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['calendarApps'],
    queryFn: () => applicationsAPI.getAll(),
  });

  if (interviewsLoading || remindersLoading || appsLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <span className="loading loading-spinner loading-lg text-amber-500"></span>
        <p className="text-slate-400 text-sm">Synchronizing schedule events...</p>
      </div>
    );
  }

  const interviews: Interview[] = interviewsData?.data || [];
  const reminders: Reminder[] = remindersData?.data || [];
  const apps: Application[] = appsData?.data || [];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const dayCells: (Date | null)[] = [];
  
  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(null);
  }

  for (let d = 1; d <= totalDays; d++) {
    dayCells.push(new Date(year, month, d));
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (date: Date | null): CalendarEvent[] => {
    if (!date) return [];
    const cellEvents: CalendarEvent[] = [];
    const dateStr = date.toDateString();

    interviews.forEach((interview) => {
      if (new Date(interview.scheduledAt).toDateString() === dateStr) {
        cellEvents.push({
          id: interview._id,
          type: 'INTERVIEW',
          title: `${interview.applicationId?.companyId?.name || 'Company'} Interview`,
          time: new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold',
          path: `/dashboard/applications/${interview.applicationId?._id}`,
        });
      }
    });

    reminders.forEach((reminder) => {
      if (!reminder.completed && new Date(reminder.dueAt).toDateString() === dateStr) {
        cellEvents.push({
          id: reminder._id,
          type: 'REMINDER',
          title: reminder.title,
          time: new Date(reminder.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold',
          path: `/dashboard/applications/${reminder.applicationId?._id}`,
        });
      }
    });

    apps.forEach((app) => {
      if (app.deadline && new Date(app.deadline).toDateString() === dateStr) {
        cellEvents.push({
          id: app._id,
          type: 'DEADLINE',
          title: `${app.companyId?.name || app.companyName || 'Company'} Deadline`,
          color: 'bg-red-500/20 text-red-400 border-red-500/40 font-semibold',
          path: `/dashboard/applications/${app._id}`,
        });
      }
    });

    return cellEvents;
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Calendar Workspace</h1>
          <p className="text-xs text-slate-400">Track deadlines, recruitment calls, and assessment tasks</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-neutral/40 border border-white/5 rounded-xl p-1">
            <button onClick={prevMonth} className="btn btn-ghost btn-xs text-slate-300 hover:text-amber-400 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-3 min-w-32 text-center">
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="btn btn-ghost btn-xs text-slate-300 hover:text-amber-400 rounded-lg">
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

      <div className="glass-card rounded-2xl p-4 overflow-hidden border-white/5">
        <div className="grid grid-cols-7 gap-2 pb-2 text-center border-b border-white/5">
          {weekdays.map((day) => (
            <span key={day} className="text-xs font-bold text-slate-500 uppercase tracking-wider py-1.5">
              {day}
            </span>
          ))}
        </div>

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
                  ${isToday ? 'border-amber-500/50 shadow-lg shadow-amber-500/5 bg-amber-500/5' : ''}
                `}
              >
                {dateVal ? (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`
                        text-xs font-bold px-1.5 py-0.5 rounded
                        ${isToday ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}
                      `}>
                        {dateVal.getDate()}
                      </span>
                    </div>

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

      <div className="flex flex-wrap items-center gap-6 justify-center text-[10px] text-slate-400 bg-neutral/10 py-3 rounded-2xl border border-white/5">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40"></span>
          Recruiter Interviews
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/40"></span>
          Due Reminders
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/40"></span>
          Application Deadlines
        </span>
      </div>

    </div>
  );
};
export default Calendar;
