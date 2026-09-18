import { Chart, registerables } from 'chart.js';
import { getStatusColor, getStatusLabel, state } from './state';

Chart.register(...registerables);

const charts: Record<string, Chart> = {};

export function getWeeklyApplications(): { labels: string[]; data: number[] } {
  const today = new Date();
  const labels: string[] = [];
  const data: number[] = [];
  for (let i = 7; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const dateStr = dt.toISOString().split('T')[0];
    labels.push(dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    data.push(state.applications.filter((a) => a.applicationDate === dateStr).length);
  }
  return { labels, data };
}

export function getAverageResponseTime(): number {
  const responded = state.applications.filter((a) =>
    a.timeline?.some((t) => t.type !== 'submitted' && t.type !== 'saved')
  );
  if (!responded.length) return 0;

  const totalDays = responded.reduce((sum, app) => {
    const submitted = app.timeline.find((t) => t.type === 'submitted');
    const firstResponse = app.timeline.find((t) => t.type !== 'submitted' && t.type !== 'saved');
    if (submitted && firstResponse) {
      const d1 = new Date(submitted.date + 'T00:00:00');
      const d2 = new Date(firstResponse.date + 'T00:00:00');
      return sum + Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
    }
    return sum;
  }, 0);

  return Math.round(totalDays / responded.length);
}

export function renderAnalytics(): void {
  const total = state.applications.length;
  const responses = state.applications.filter((a) => !['saved', 'applied'].includes(a.status)).length;
  const interviews = state.applications.filter((a) =>
    ['interview', 'final_interview', 'assessment'].includes(a.status)
  ).length;
  const offers = state.applications.filter((a) => ['offer', 'accepted'].includes(a.status)).length;

  const responseRate = total ? Math.round((responses / total) * 100) : 0;
  const interviewRate = total ? Math.round((interviews / total) * 100) : 0;
  const offerRate = total ? Math.round((offers / total) * 100) : 0;
  const rejectionRate = total
    ? Math.round((state.applications.filter((a) => a.status === 'rejected').length / total) * 100)
    : 0;

  // 1. KPI Cards
  const kpisContainer = document.getElementById('analyticsKpis');
  if (kpisContainer) {
    const kpis = [
      { label: 'Response Rate', value: responseRate + '%', color: '#3b82f6' },
      { label: 'Interview Rate', value: interviewRate + '%', color: '#3b82f6' },
      { label: 'Offer Rate', value: offerRate + '%', color: '#1d4ed8' },
      { label: 'Rejection Rate', value: rejectionRate + '%', color: '#475569' },
    ];
    kpisContainer.innerHTML = kpis
      .map(
        (k) => `
        <div class="card p-5 text-center border-t-4" style="border-top-color: ${k.color}">
            <p class="text-sm font-semibold text-stone-500">${k.label}</p>
            <p class="text-3xl font-bold mt-2" style="color: ${k.color}">${k.value}</p>
        </div>
      `
      )
      .join('');
  }

  // 2. Chart 1: Status Chart (Doughnut)
  const statusCounts: Record<string, number> = {};
  state.applications.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });
  const statusLabels = Object.keys(statusCounts).map((s) => getStatusLabel(s));
  const statusData = Object.keys(statusCounts).map((s) => statusCounts[s]);
  const statusColors = Object.keys(statusCounts).map((s) => getStatusColor(s));

  const statusCanvas = document.getElementById('statusChart') as HTMLCanvasElement | null;
  if (statusCanvas) {
    if (charts.statusChart) charts.statusChart.destroy();
    charts.statusChart = new Chart(statusCanvas, {
      type: 'doughnut',
      data: {
        labels: statusLabels,
        datasets: [
          {
            data: statusData,
            backgroundColor: statusColors,
            borderWidth: 2,
            borderColor: 'white',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { size: 11 }, boxWidth: 12, padding: 8 },
          },
        },
      },
    });
  }

  // 3. Chart 2: Conversion Funnel Chart (Horizontal Bar)
  const funnelLabels = ['Total', 'Responses', 'Interviews', 'Offers'];
  const funnelData = [total, responses, interviews, offers];
  const funnelCanvas = document.getElementById('funnelChart') as HTMLCanvasElement | null;
  if (funnelCanvas) {
    if (charts.funnelChart) charts.funnelChart.destroy();
    charts.funnelChart = new Chart(funnelCanvas, {
      type: 'bar',
      data: {
        labels: funnelLabels,
        datasets: [
          {
            label: 'Applications',
            data: funnelData,
            backgroundColor: ['#1d4ed8', '#93c5fd', '#bfdbfe', '#dbeafe'],
            borderRadius: 8,
            barThickness: 60,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: '#f5f5f4' } },
          y: { grid: { display: false } },
        },
      },
    });
  }

  // 4. Chart 3: Weekly Activity Chart (Line)
  const weekly = getWeeklyApplications();
  const weeklyCanvas = document.getElementById('weeklyChart') as HTMLCanvasElement | null;
  if (weeklyCanvas) {
    if (charts.weeklyChart) charts.weeklyChart.destroy();
    charts.weeklyChart = new Chart(weeklyCanvas, {
      type: 'line',
      data: {
        labels: weekly.labels,
        datasets: [
          {
            label: 'Applications',
            data: weekly.data,
            borderColor: '#1d4ed8',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#1d4ed8',
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f5f5f4' } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  // 5. Chart 4: Source Chart (Pie)
  const sourceCounts: Record<string, number> = {};
  state.applications.forEach((a) => {
    const s = a.source || 'Unknown';
    sourceCounts[s] = (sourceCounts[s] || 0) + 1;
  });
  const sourceLabels = Object.keys(sourceCounts);
  const sourceData = Object.keys(sourceCounts).map((s) => sourceCounts[s]);
  const sourceCanvas = document.getElementById('sourceChart') as HTMLCanvasElement | null;
  if (sourceCanvas) {
    if (charts.sourceChart) charts.sourceChart.destroy();
    charts.sourceChart = new Chart(sourceCanvas, {
      type: 'pie',
      data: {
        labels: sourceLabels,
        datasets: [
          {
            data: sourceData,
            backgroundColor: ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#93c5fd', '#38bdf8', '#64748b'],
            borderWidth: 2,
            borderColor: 'white',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { size: 11 }, boxWidth: 12, padding: 8 },
          },
        },
      },
    });
  }

  // 6. Response Metrics Cards
  const avgResponseTime = getAverageResponseTime();
  const responseMetricsEl = document.getElementById('responseMetrics');
  if (responseMetricsEl) {
    responseMetricsEl.innerHTML = `
      <div class="p-4 rounded-lg bg-stone-50 text-center">
          <p class="text-xs text-stone-500 font-semibold">Avg Response Time</p>
          <p class="text-2xl font-bold text-stone-800 mt-1">${avgResponseTime} days</p>
      </div>
      <div class="p-4 rounded-lg bg-blue-50 text-center">
          <p class="text-xs text-stone-500 font-semibold">Total Applications</p>
          <p class="text-2xl font-bold text-blue-600 mt-1">${total}</p>
      </div>
      <div class="p-4 rounded-lg bg-blue-50 text-center">
          <p class="text-xs text-stone-500 font-semibold">Interviews Secured</p>
          <p class="text-2xl font-bold text-blue-600 mt-1">${interviews}</p>
      </div>
      <div class="p-4 rounded-lg bg-blue-50 text-center">
          <p class="text-xs text-stone-500 font-semibold">Offers Received</p>
          <p class="text-2xl font-bold text-blue-700 mt-1">${offers}</p>
      </div>
    `;
  }
}
