import { state } from './state';
import { escapeHtml, formatDate, showToast } from './utils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export type CalendarCategory = 'interview' | 'deadline' | 'applied' | 'offer' | 'other';

export interface CustomCalendarEvent {
  id: string;
  title: string;
  company?: string;
  category: CalendarCategory;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  location?: string;
  notes?: string;
  applicationId?: number;
  createdAt: string;
}

export interface UnifiedCalendarEvent {
  id: string;
  source: 'application_deadline' | 'application_applied' | 'application_timeline' | 'custom';
  title: string;
  company: string;
  category: CalendarCategory;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  notes?: string;
  applicationId?: number;
  isCustom?: boolean;
}

// Module State
let currentViewMode: 'month' | 'agenda' = 'month';
let currentCategoryFilter: 'all' | CalendarCategory = 'all';
let activeDayDate: string | null = null;

const STORAGE_KEY = 'applytrack_calendar_events';

// Persistence helpers
export function getCustomCalendarEvents(): CustomCalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load custom calendar events:', err);
    return [];
  }
}

export function saveCustomCalendarEvents(events: CustomCalendarEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save custom calendar events:', err);
  }
}

// Extract and unify all events from applications + custom storage
export function getAllCalendarEvents(): UnifiedCalendarEvent[] {
  const events: UnifiedCalendarEvent[] = [];

  // 1. Extract from state.applications
  if (Array.isArray(state.applications)) {
    state.applications.forEach((app) => {
      // Deadlines (Take-home, assessments, offer response deadlines)
      if (app.deadline) {
        const cleanDate = app.deadline.split('T')[0];
        events.push({
          id: `app-deadline-${app.id}`,
          source: 'application_deadline',
          title: `Deadline: ${app.title}`,
          company: app.company,
          category: 'deadline',
          date: cleanDate,
          applicationId: app.id,
          notes: app.notes || 'Application deadline / take-home assessment milestone.',
          location: app.workMode || app.location || '',
          isCustom: false,
        });
      }

      // Application Submission Dates
      if (app.applicationDate) {
        const cleanDate = app.applicationDate.split('T')[0];
        events.push({
          id: `app-applied-${app.id}`,
          source: 'application_applied',
          title: `Applied: ${app.title}`,
          company: app.company,
          category: 'applied',
          date: cleanDate,
          applicationId: app.id,
          notes: `Applied via ${app.source || 'Direct'}. Priority: ${app.priority}`,
          location: app.location || '',
          isCustom: false,
        });
      }

      // Timeline entries (Interviews, Screens, Offers)
      if (Array.isArray(app.timeline)) {
        app.timeline.forEach((tl, idx) => {
          if (!tl.date) return;
          const cleanDate = tl.date.split('T')[0];
          const lowerEv = (tl.event || '').toLowerCase();
          const lowerType = (tl.type || '').toLowerCase();

          let category: CalendarCategory = 'interview';
          if (lowerType.includes('offer') || lowerEv.includes('offer')) {
            category = 'offer';
          } else if (lowerType.includes('deadline') || lowerEv.includes('deadline') || lowerEv.includes('assessment')) {
            category = 'deadline';
          } else if (lowerType.includes('submitted') || lowerEv.includes('submitted')) {
            category = 'applied';
          } else if (lowerType.includes('interview') || lowerType.includes('screen') || lowerEv.includes('interview') || lowerEv.includes('screening')) {
            category = 'interview';
          } else {
            category = 'other';
          }

          events.push({
            id: `app-timeline-${app.id}-${idx}`,
            source: 'application_timeline',
            title: tl.event || 'Interview / Meeting',
            company: app.company,
            category,
            date: cleanDate,
            applicationId: app.id,
            notes: app.notes || '',
            location: app.workMode || '',
            isCustom: false,
          });
        });
      }
    });
  }

  // 2. Add custom scheduled events from localStorage
  const customEvents = getCustomCalendarEvents();
  customEvents.forEach((ce) => {
    events.push({
      id: ce.id,
      source: 'custom',
      title: ce.title,
      company: ce.company || 'Personal Milestone',
      category: ce.category || 'other',
      date: ce.date,
      time: ce.time,
      location: ce.location,
      notes: ce.notes,
      applicationId: ce.applicationId,
      isCustom: true,
    });
  });

  // Sort chronologically ascending
  return events.sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return (a.time || '').localeCompare(b.time || '');
  });
}

// Category styling helpers
function getCategoryPillClasses(category: CalendarCategory): { bgClass: string; icon: string; label: string } {
  switch (category) {
    case 'interview':
      return {
        bgClass: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
        icon: '🎤',
        label: 'Interview',
      };
    case 'deadline':
      return {
        bgClass: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
        icon: '⏰',
        label: 'Deadline',
      };
    case 'applied':
      return {
        bgClass: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
        icon: '📄',
        label: 'Submitted',
      };
    case 'offer':
      return {
        bgClass: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
        icon: '🎯',
        label: 'Offer',
      };
    case 'other':
    default:
      return {
        bgClass: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700',
        icon: '📌',
        label: 'Milestone',
      };
  }
}

// Navigation
export function changeCalendarMonth(offset: number): void {
  state.calendarMonth += offset;
  if (state.calendarMonth > 11) {
    state.calendarMonth = 0;
    state.calendarYear++;
  } else if (state.calendarMonth < 0) {
    state.calendarMonth = 11;
    state.calendarYear--;
  }
  renderCalendar();
}

export function navigateCalendar(offset: number): void {
  changeCalendarMonth(offset);
}

export function jumpToToday(): void {
  const now = new Date();
  state.calendarMonth = now.getMonth();
  state.calendarYear = now.getFullYear();
  renderCalendar();
}

// View Mode Switching
export function setCalendarViewMode(mode: 'month' | 'agenda'): void {
  currentViewMode = mode;
  const btnMonth = document.getElementById('calendarBtnMonthView');
  const btnAgenda = document.getElementById('calendarBtnAgendaView');
  const monthContainer = document.getElementById('calendarMonthViewContainer');
  const agendaContainer = document.getElementById('calendarAgendaViewContainer');

  if (mode === 'month') {
    btnMonth?.classList.add('bg-white', 'dark:bg-[#121a2b]', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm', 'font-bold');
    btnMonth?.classList.remove('text-stone-600', 'dark:text-stone-400');
    btnAgenda?.classList.remove('bg-white', 'dark:bg-[#121a2b]', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm', 'font-bold');
    btnAgenda?.classList.add('text-stone-600', 'dark:text-stone-400');

    monthContainer?.classList.remove('hidden');
    agendaContainer?.classList.add('hidden');
  } else {
    btnAgenda?.classList.add('bg-white', 'dark:bg-[#121a2b]', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm', 'font-bold');
    btnAgenda?.classList.remove('text-stone-600', 'dark:text-stone-400');
    btnMonth?.classList.remove('bg-white', 'dark:bg-[#121a2b]', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm', 'font-bold');
    btnMonth?.classList.add('text-stone-600', 'dark:text-stone-400');

    agendaContainer?.classList.remove('hidden');
    monthContainer?.classList.add('hidden');
  }

  renderCalendar();
}

// Category Filter Switching
export function setCalendarFilter(filter: string): void {
  currentCategoryFilter = filter as ('all' | CalendarCategory);

  const chips = document.querySelectorAll('#calendarFilterBar button');
  chips.forEach((chip) => {
    const chipFilter = chip.getAttribute('data-calendar-filter');
    if (chipFilter === filter) {
      chip.className = 'calendar-filter-chip active-filter px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm transition-all';
    } else {
      chip.className = 'calendar-filter-chip px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all';
    }
  });

  renderCalendar();
}

// Main Render Function
export function renderCalendar(): void {
  const monthLabel = document.getElementById('calendarMonthLabel') || document.getElementById('calendarMonthTitle');
  const grid = document.getElementById('calendarGrid');
  const agendaList = document.getElementById('calendarAgendaList');
  const agendaCount = document.getElementById('calendarAgendaCount');
  const upcomingList = document.getElementById('calendarEventsList') || document.getElementById('calendarUpcomingList');

  // Month Title
  if (monthLabel) {
    monthLabel.textContent = `${MONTH_NAMES[state.calendarMonth]} ${state.calendarYear}`;
  }

  // Get all unified events and apply category filter
  const allEvents = getAllCalendarEvents();
  const filteredEvents = currentCategoryFilter === 'all'
    ? allEvents
    : allEvents.filter((ev) => ev.category === currentCategoryFilter);

  // Update Summary Counts
  const interviewCount = allEvents.filter((e) => e.category === 'interview').length;
  const deadlineCount = allEvents.filter((e) => e.category === 'deadline').length;

  const calCountInterviews = document.getElementById('calCountInterviews');
  if (calCountInterviews) calCountInterviews.textContent = `${interviewCount} Interview${interviewCount === 1 ? '' : 's'}`;

  const calCountDeadlines = document.getElementById('calCountDeadlines');
  if (calCountDeadlines) calCountDeadlines.textContent = `${deadlineCount} Deadline${deadlineCount === 1 ? '' : 's'}`;

  const totalBadge = document.getElementById('calendarTotalBadge');
  if (totalBadge) totalBadge.textContent = `${allEvents.length} Event${allEvents.length === 1 ? '' : 's'}`;

  // 1. Render Month Grid
  if (grid) {
    const firstDay = new Date(state.calendarYear, state.calendarMonth, 1).getDay();
    const daysInMonth = new Date(state.calendarYear, state.calendarMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(state.calendarYear, state.calendarMonth, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === state.calendarMonth && today.getFullYear() === state.calendarYear;

    let html = '';

    // Leading days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevMonth = state.calendarMonth === 0 ? 11 : state.calendarMonth - 1;
      const prevYear = state.calendarMonth === 0 ? state.calendarYear - 1 : state.calendarYear;
      const prevDateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;

      html += `
        <div class="calendar-day opacity-40 hover:opacity-75 transition-opacity cursor-pointer p-2 min-h-[96px] border border-dashed border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50/50 dark:bg-stone-900/30 flex flex-col justify-between" onclick="openDayDetailModal('${prevDateStr}')">
          <div class="text-right text-xs font-semibold text-stone-400 dark:text-stone-600">${prevDay}</div>
        </div>
      `;
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && today.getDate() === day;
      const dateStr = `${state.calendarYear}-${String(state.calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const dayEvents = filteredEvents.filter((e) => e.date === dateStr);

      html += `
        <div class="calendar-day p-2 min-h-[96px] border border-stone-200 dark:border-stone-800/90 rounded-xl bg-white dark:bg-[#121a2b] flex flex-col justify-between transition-all duration-150 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer ${
          isToday ? 'ring-2 ring-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-sm' : ''
        }" onclick="openDayDetailModal('${dateStr}')" title="Click to view schedule for ${dateStr}">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-stone-400 dark:text-stone-500'}">
              ${isToday ? 'Today' : ''}
            </span>
            <span class="text-xs font-bold ${isToday ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-stone-700 dark:text-stone-300'}">
              ${day}
            </span>
          </div>

          <div class="space-y-1 overflow-hidden mt-1 flex-1">
            ${dayEvents
              .slice(0, 3)
              .map((e) => {
                const style = getCategoryPillClasses(e.category);
                return `
                  <div class="calendar-event-pill text-[10px] font-semibold truncate px-1.5 py-0.5 rounded-md flex items-center gap-1 ${style.bgClass}"
                       title="${escapeHtml(e.company)}: ${escapeHtml(e.title)} ${e.time ? '(' + e.time + ')' : ''}">
                    <span>${style.icon}</span>
                    <span class="truncate">${escapeHtml(e.company || e.title)}</span>
                  </div>
                `;
              })
              .join('')}
            ${
              dayEvents.length > 3
                ? `<div class="calendar-more text-[9px] font-bold text-blue-600 dark:text-blue-400 pl-1">+${dayEvents.length - 3} more</div>`
                : ''
            }
          </div>
        </div>
      `;
    }

    // Trailing days from next month to round out the grid
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
      const nextMonth = state.calendarMonth === 11 ? 0 : state.calendarMonth + 1;
      const nextYear = state.calendarMonth === 11 ? state.calendarYear + 1 : state.calendarYear;
      const nextDateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;

      html += `
        <div class="calendar-day opacity-40 hover:opacity-75 transition-opacity cursor-pointer p-2 min-h-[96px] border border-dashed border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50/50 dark:bg-stone-900/30 flex flex-col justify-between" onclick="openDayDetailModal('${nextDateStr}')">
          <div class="text-right text-xs font-semibold text-stone-400 dark:text-stone-600">${nextDay}</div>
        </div>
      `;
    }

    grid.innerHTML = html;
  }

  // 2. Render Agenda View
  if (agendaList) {
    if (agendaCount) {
      agendaCount.textContent = `${filteredEvents.length} Event${filteredEvents.length === 1 ? '' : 's'}`;
    }

    if (filteredEvents.length === 0) {
      agendaList.innerHTML = `
        <div class="text-center py-12 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-8 bg-stone-50/50 dark:bg-stone-900/20">
          <div class="text-3xl mb-2">📅</div>
          <h4 class="font-bold text-stone-800 dark:text-stone-200 text-sm">No scheduled events in this filter</h4>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">There are no upcoming rounds, take-homes, or submissions matching your criteria.</p>
          <button onclick="openAddCalendarEventModal()" class="btn-primary mt-4 text-xs px-4 py-2 rounded-xl">Schedule an Event</button>
        </div>
      `;
    } else {
      // Group by date
      const grouped = new Map<string, UnifiedCalendarEvent[]>();
      filteredEvents.forEach((ev) => {
        const list = grouped.get(ev.date) || [];
        list.push(ev);
        grouped.set(ev.date, list);
      });

      let agendaHtml = '';
      grouped.forEach((eventsOnDate, dateStr) => {
        const dateObj = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = DAY_NAMES[dateObj.getDay()];
        const formatted = formatDate(dateStr);

        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        agendaHtml += `
          <div class="agenda-date-group border border-stone-200 dark:border-stone-800 rounded-2xl p-4 bg-white dark:bg-[#121a2b] shadow-sm">
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800/80">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-stone-800 dark:text-stone-200'}">
                  ${dayOfWeek}, ${formatted}
                </span>
                ${isToday ? '<span class="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">Today</span>' : ''}
              </div>
              <span class="text-xs font-medium text-stone-500 dark:text-stone-400">${eventsOnDate.length} item${eventsOnDate.length === 1 ? '' : 's'}</span>
            </div>

            <div class="space-y-2.5">
              ${eventsOnDate
                .map((ev) => {
                  const style = getCategoryPillClasses(ev.category);
                  return `
                    <div class="p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-100/80 dark:hover:bg-stone-800/60 transition-colors">
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm ${style.bgClass} flex-shrink-0 mt-0.5">
                          ${style.icon}
                        </div>
                        <div>
                          <div class="flex items-center gap-2 flex-wrap">
                            <h4 class="font-bold text-xs text-stone-900 dark:text-white">${escapeHtml(ev.title)}</h4>
                            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md ${style.bgClass}">${style.label}</span>
                          </div>
                          <div class="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 mt-1 flex-wrap">
                            <span class="font-semibold text-stone-700 dark:text-stone-300">🏢 ${escapeHtml(ev.company)}</span>
                            ${ev.time ? `<span>⏰ ${escapeHtml(ev.time)}</span>` : ''}
                            ${ev.location ? `<span>📍 ${escapeHtml(ev.location)}</span>` : ''}
                          </div>
                          ${ev.notes ? `<p class="text-[11px] text-stone-500 dark:text-stone-400 mt-1 italic">${escapeHtml(ev.notes)}</p>` : ''}
                        </div>
                      </div>

                      <div class="flex items-center gap-2 sm:self-center">
                        ${
                          ev.applicationId
                            ? `<button onclick="window.openAppDetails(${ev.applicationId})" class="btn-outline px-2.5 py-1 text-[11px] rounded-lg text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-900/20">View Application</button>`
                            : ''
                        }
                        ${
                          ev.isCustom
                            ? `<button onclick="deleteCalendarEvent('${ev.id}')" class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" title="Delete custom event">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>`
                            : ''
                        }
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>
        `;
      });

      agendaList.innerHTML = agendaHtml;
    }
  }

  // 3. Render Priority Upcoming Schedule (Next 14 Days)
  if (upcomingList) {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = allEvents
      .filter((ev) => ev.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);

    const upcomingBadge = document.getElementById('calendarUpcomingCountBadge');
    if (upcomingBadge) {
      upcomingBadge.textContent = `${upcoming.length} upcoming`;
    }

    if (upcoming.length === 0) {
      upcomingList.innerHTML = `
        <div class="text-center py-6 text-xs text-stone-500 dark:text-stone-400">
          No upcoming interviews or deadlines in the next 14 days. Click <strong>+ Add Event</strong> to schedule a round!
        </div>
      `;
    } else {
      upcomingList.innerHTML = upcoming
        .map((ev) => {
          const style = getCategoryPillClasses(ev.category);
          return `
            <div class="p-3 bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between cursor-pointer hover:bg-stone-100/80 dark:hover:bg-stone-800/60 transition-colors"
                 onclick="${ev.applicationId ? `window.openAppDetails(${ev.applicationId})` : `openDayDetailModal('${ev.date}')`}">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm ${style.bgClass}">
                  ${style.icon}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold text-xs text-stone-900 dark:text-white">${escapeHtml(ev.company)}</h4>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded ${style.bgClass}">${style.label}</span>
                  </div>
                  <p class="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[240px]">${escapeHtml(ev.title)}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${style.bgClass}">${formatDate(ev.date)}</span>
                ${ev.time ? `<div class="text-[10px] text-stone-400 mt-1">${escapeHtml(ev.time)}</div>` : ''}
              </div>
            </div>
          `;
        })
        .join('');
    }
  }
}

// Day Detail Modal
export function openDayDetailModal(dateStr?: string): void {
  const modal = document.getElementById('dayDetailModal');
  if (!modal) return;

  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  activeDayDate = targetDate;
  (window as any)._activeCalendarDayDate = targetDate;

  const dateObj = new Date(targetDate + 'T00:00:00');
  const dayName = DAY_NAMES[dateObj.getDay()];
  const formatted = formatDate(targetDate);

  const titleEl = document.getElementById('dayDetailModalTitle');
  const subEl = document.getElementById('dayDetailModalSubtitle');
  const listEl = document.getElementById('dayDetailEventsList');

  if (titleEl) titleEl.textContent = `${dayName}, ${formatted}`;
  if (subEl) subEl.textContent = `Scheduled milestones & actions for ${targetDate}`;

  const allEvents = getAllCalendarEvents();
  const dayEvents = allEvents.filter((ev) => ev.date === targetDate);

  if (listEl) {
    if (dayEvents.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-8 bg-stone-50 dark:bg-stone-900/30 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 p-4">
          <div class="text-2xl mb-1">🕊️</div>
          <p class="text-xs font-semibold text-stone-700 dark:text-stone-300">Nothing scheduled for this day</p>
          <p class="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Use the button below to schedule an interview round, assessment deadline, or personal prep reminder.</p>
        </div>
      `;
    } else {
      listEl.innerHTML = dayEvents
        .map((ev) => {
          const style = getCategoryPillClasses(ev.category);
          return `
            <div class="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-base">${style.icon}</span>
                  <span class="font-bold text-xs text-stone-900 dark:text-white">${escapeHtml(ev.title)}</span>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${style.bgClass}">${style.label}</span>
              </div>

              <div class="flex items-center gap-3 text-[11px] text-stone-600 dark:text-stone-400 flex-wrap">
                <span>🏢 <strong>${escapeHtml(ev.company)}</strong></span>
                ${ev.time ? `<span>⏰ <strong>${escapeHtml(ev.time)}</strong></span>` : ''}
                ${ev.location ? `<span>📍 <strong>${escapeHtml(ev.location)}</strong></span>` : ''}
              </div>

              ${ev.notes ? `<div class="text-[11px] text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-800/80 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60">${escapeHtml(ev.notes)}</div>` : ''}

              <div class="flex items-center justify-end gap-2 pt-1 border-t border-stone-200/60 dark:border-stone-800/60">
                ${
                  ev.applicationId
                    ? `<button onclick="closeDayDetailModal(); window.openAppDetails(${ev.applicationId});" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View Application</button>`
                    : ''
                }
                ${
                  ev.isCustom
                    ? `<button onclick="deleteCalendarEvent('${ev.id}')" class="text-xs font-semibold text-rose-500 hover:underline">Delete</button>`
                    : ''
                }
              </div>
            </div>
          `;
        })
        .join('');
    }
  }

  modal.classList.remove('hidden');
}

export function closeDayDetailModal(): void {
  const modal = document.getElementById('dayDetailModal');
  if (modal) modal.classList.add('hidden');
}

// Add/Edit Event Modal
export function openAddCalendarEventModal(prefilledDate?: string): void {
  const modal = document.getElementById('calendarEventModal');
  if (!modal) return;

  const titleInput = document.getElementById('calEventTitle') as HTMLInputElement | null;
  const catInput = document.getElementById('calEventCategory') as HTMLSelectElement | null;
  const compInput = document.getElementById('calEventCompany') as HTMLInputElement | null;
  const dateInput = document.getElementById('calEventDate') as HTMLInputElement | null;
  const timeInput = document.getElementById('calEventTime') as HTMLInputElement | null;
  const locInput = document.getElementById('calEventLocation') as HTMLInputElement | null;
  const notesInput = document.getElementById('calEventNotes') as HTMLTextAreaElement | null;
  const appSelect = document.getElementById('calEventAppSelect') as HTMLSelectElement | null;
  const idInput = document.getElementById('calEventId') as HTMLInputElement | null;

  if (idInput) idInput.value = '';
  if (titleInput) titleInput.value = '';
  if (catInput) catInput.value = 'interview';
  if (compInput) compInput.value = '';
  if (dateInput) {
    dateInput.value = prefilledDate || activeDayDate || new Date().toISOString().split('T')[0];
  }
  if (timeInput) timeInput.value = '10:00';
  if (locInput) locInput.value = '';
  if (notesInput) notesInput.value = '';

  // Populate Application Dropdown
  if (appSelect) {
    let opts = '<option value="">None (Standalone event)</option>';
    if (Array.isArray(state.applications)) {
      state.applications.forEach((app) => {
        opts += `<option value="${app.id}">${escapeHtml(app.company)} - ${escapeHtml(app.title)}</option>`;
      });
    }
    appSelect.innerHTML = opts;
    appSelect.value = '';
  }

  modal.classList.remove('hidden');
}

export function closeAddCalendarEventModal(): void {
  const modal = document.getElementById('calendarEventModal');
  if (modal) modal.classList.add('hidden');
}

export function handleCalendarAppSelect(appIdStr: string): void {
  if (!appIdStr) return;
  const appId = parseInt(appIdStr, 10);
  const app = state.applications.find((a) => a.id === appId);
  if (!app) return;

  const compInput = document.getElementById('calEventCompany') as HTMLInputElement | null;
  const locInput = document.getElementById('calEventLocation') as HTMLInputElement | null;

  if (compInput && !compInput.value.trim()) {
    compInput.value = app.company;
  }
  if (locInput && !locInput.value.trim() && app.workMode) {
    locInput.value = app.workMode;
  }
}

export function saveCalendarEvent(event: Event): void {
  event.preventDefault();

  const titleInput = document.getElementById('calEventTitle') as HTMLInputElement | null;
  const catInput = document.getElementById('calEventCategory') as HTMLSelectElement | null;
  const compInput = document.getElementById('calEventCompany') as HTMLInputElement | null;
  const dateInput = document.getElementById('calEventDate') as HTMLInputElement | null;
  const timeInput = document.getElementById('calEventTime') as HTMLInputElement | null;
  const locInput = document.getElementById('calEventLocation') as HTMLInputElement | null;
  const notesInput = document.getElementById('calEventNotes') as HTMLTextAreaElement | null;
  const appSelect = document.getElementById('calEventAppSelect') as HTMLSelectElement | null;

  const title = titleInput?.value.trim();
  const date = dateInput?.value.trim();

  if (!title || !date) {
    showToast('Event title and date are required', 'error');
    return;
  }

  const category = (catInput?.value || 'interview') as CalendarCategory;
  const company = compInput?.value.trim() || '';
  const time = timeInput?.value.trim() || undefined;
  const location = locInput?.value.trim() || undefined;
  const notes = notesInput?.value.trim() || undefined;
  const applicationId = appSelect?.value ? parseInt(appSelect.value, 10) : undefined;

  const newEvent: CustomCalendarEvent = {
    id: `custom-event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    company: company || 'Personal Milestone',
    category,
    date,
    time,
    location,
    notes,
    applicationId,
    createdAt: new Date().toISOString(),
  };

  const existing = getCustomCalendarEvents();
  existing.push(newEvent);
  saveCustomCalendarEvents(existing);

  closeAddCalendarEventModal();
  renderCalendar();

  // If day detail modal was open for this date, re-render it
  if (activeDayDate === date) {
    openDayDetailModal(date);
  }

  showToast(`Scheduled "${title}" on ${formatDate(date)}`, 'success');
}

export function deleteCalendarEvent(id: string): void {
  const existing = getCustomCalendarEvents();
  const filtered = existing.filter((e) => e.id !== id);
  saveCustomCalendarEvents(filtered);

  renderCalendar();

  if (activeDayDate) {
    openDayDetailModal(activeDayDate);
  }

  showToast('Calendar event removed', 'info');
}

// RFC 5545 iCalendar (.ics) Export
export function exportCalendarICS(): void {
  const events = getAllCalendarEvents();

  if (events.length === 0) {
    showToast('No events to export yet.', 'info');
    return;
  }

  // Format UTC now stamp
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const nowStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const formatICSDate = (dateStr: string, timeStr?: string): { dtStart: string; dtEnd: string } => {
    const cleanDate = dateStr.replace(/-/g, '');
    if (timeStr && /^\d{2}:\d{2}$/.test(timeStr)) {
      const [hh, mm] = timeStr.split(':').map((s) => parseInt(s, 10));
      const startStr = `${cleanDate}T${pad(hh)}${pad(mm)}00`;
      const endHh = (hh + 1) % 24;
      const endStr = `${cleanDate}T${pad(endHh)}${pad(mm)}00`;
      return {
        dtStart: `DTSTART:${startStr}`,
        dtEnd: `DTEND:${endStr}`,
      };
    } else {
      // Full day event
      return {
        dtStart: `DTSTART;VALUE=DATE:${cleanDate}`,
        dtEnd: `DTEND;VALUE=DATE:${cleanDate}`,
      };
    }
  };

  const escapeICS = (str: string): string => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ApplyTrack AI//Job Search Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ApplyTrack AI Job Search Schedule',
    'X-WR-TIMEZONE:UTC',
  ];

  events.forEach((ev) => {
    const { dtStart, dtEnd } = formatICSDate(ev.date, ev.time);
    const summary = `${ev.company ? ev.company + ': ' : ''}${ev.title}`;
    const descParts: string[] = [];
    if (ev.company) descParts.push(`Company: ${ev.company}`);
    if (ev.category) descParts.push(`Category: ${ev.category.toUpperCase()}`);
    if (ev.location) descParts.push(`Location / Link: ${ev.location}`);
    if (ev.notes) descParts.push(`Notes: ${ev.notes}`);
    descParts.push('Managed via ApplyTrack AI');

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:${ev.id.replace(/[^a-zA-Z0-9_-]/g, '_')}@applytrack.ai`);
    icsLines.push(`DTSTAMP:${nowStamp}`);
    icsLines.push(dtStart);
    icsLines.push(dtEnd);
    icsLines.push(`SUMMARY:${escapeICS(summary)}`);
    icsLines.push(`DESCRIPTION:${escapeICS(descParts.join('\n'))}`);
    if (ev.location) {
      icsLines.push(`LOCATION:${escapeICS(ev.location)}`);
    }
    icsLines.push('STATUS:CONFIRMED');
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');

  const icsBlob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(icsBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `applytrack-schedule-${now.toISOString().split('T')[0]}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  showToast('Exported calendar as .ics! Import into Google, Apple, or Outlook Calendar.', 'success');
}
