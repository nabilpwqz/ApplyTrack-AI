import Application from '../models/Application.js';
import Company from '../models/Company.js';

export const getAnalyticsSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const apps = await Application.find({ userId }).populate('companyId');

    if (!apps || apps.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            total: 0,
            active: 0,
            interviews: 0,
            offers: 0,
            responseRate: 0,
            interviewRate: 0,
            offerRate: 0,
            avgResponseDays: 0,
          },
          funnel: {
            SAVED: 0,
            APPLIED: 0,
            SCREENING: 0,
            ASSESSMENT: 0,
            INTERVIEW: 0,
            FINAL_INTERVIEW: 0,
            OFFER: 0,
            ACCEPTED: 0,
            REJECTED: 0,
            WITHDRAWN: 0,
            GHOSTED: 0,
          },
          weeklyTrend: [],
          sourceAnalysis: [],
          companyAnalysis: [],
        },
      });
    }

    // 1. Calculate General Metrics
    const total = apps.length;
    const active = apps.filter(a => ['SAVED', 'APPLIED', 'SCREENING', 'ASSESSMENT', 'INTERVIEW', 'FINAL_INTERVIEW', 'OFFER'].includes(a.status)).length;
    const interviews = apps.filter(a => ['INTERVIEW', 'FINAL_INTERVIEW'].includes(a.status)).length;
    const offers = apps.filter(a => ['OFFER', 'ACCEPTED'].includes(a.status)).length;

    // Response definition: Got anything other than SAVED or APPLIED (meaning they didn't just apply, they got screened, interview, assessment, offer, or rejection)
    const respondedApps = apps.filter(a => !['SAVED', 'APPLIED'].includes(a.status));
    const responseRate = total > 0 ? Math.round((respondedApps.length / total) * 100) : 0;
    const interviewRate = total > 0 ? Math.round((apps.filter(a => ['INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'ACCEPTED'].includes(a.status)).length / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

    // Calculate Average Response Days
    let totalResponseDays = 0;
    let countedResponses = 0;
    apps.forEach(a => {
      // Find the first status change or event after creation
      const statusChange = a.timeline.find(t => t.type === 'STATUS_CHANGE' || t.type === 'EMAIL_RECEIVED');
      if (statusChange) {
        const diffTime = Math.abs(statusChange.occurredAt - a.applicationDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalResponseDays += diffDays;
        countedResponses++;
      }
    });
    const avgResponseDays = countedResponses > 0 ? Math.round(totalResponseDays / countedResponses) : 5; // default 5 if no data

    // 2. Funnel Analysis
    const funnel = {
      SAVED: apps.filter(a => a.status === 'SAVED').length,
      APPLIED: apps.filter(a => a.status === 'APPLIED').length,
      SCREENING: apps.filter(a => a.status === 'SCREENING').length,
      ASSESSMENT: apps.filter(a => a.status === 'ASSESSMENT').length,
      INTERVIEW: apps.filter(a => a.status === 'INTERVIEW').length,
      FINAL_INTERVIEW: apps.filter(a => a.status === 'FINAL_INTERVIEW').length,
      OFFER: apps.filter(a => a.status === 'OFFER').length,
      ACCEPTED: apps.filter(a => a.status === 'ACCEPTED').length,
      REJECTED: apps.filter(a => a.status === 'REJECTED').length,
      WITHDRAWN: apps.filter(a => a.status === 'WITHDRAWN').length,
      GHOSTED: apps.filter(a => a.status === 'GHOSTED').length,
    };

    // 3. Weekly Trends (group apps by day of the week based on last 7 days)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyMap = {};
    daysOfWeek.forEach(day => { weeklyMap[day] = 0; });
    
    // Fallback: Populate last 7 days of dates
    const weeklyTrend = [];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      last7Days.push(dayName);
      weeklyMap[dayName] = 0; // initialize
    }

    apps.forEach(a => {
      const appDay = daysOfWeek[new Date(a.applicationDate).getDay()];
      if (weeklyMap[appDay] !== undefined) {
        weeklyMap[appDay]++;
      }
    });

    last7Days.forEach(day => {
      weeklyTrend.push({
        day,
        count: weeklyMap[day] || 0,
      });
    });

    // 4. Source Analysis
    const sourceMap = {};
    apps.forEach(a => {
      const src = a.source || 'Other';
      if (!sourceMap[src]) {
        sourceMap[src] = { source: src, count: 0, responses: 0, interviews: 0 };
      }
      sourceMap[src].count++;
      if (!['SAVED', 'APPLIED'].includes(a.status)) {
        sourceMap[src].responses++;
      }
      if (['INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'ACCEPTED'].includes(a.status)) {
        sourceMap[src].interviews++;
      }
    });

    const sourceAnalysis = Object.values(sourceMap).map(s => ({
      source: s.source,
      applications: s.count,
      responseRate: Math.round((s.responses / s.count) * 100),
      interviewRate: Math.round((s.interviews / s.count) * 100),
    })).sort((a, b) => b.applications - a.applications);

    // 5. Response Rate by Company Size
    const sizeMap = {
      'Enterprise': { size: 'Enterprise (1000+ employees)', count: 0, responses: 0 },
      'Mid-size': { size: 'Mid-size (51-1000 employees)', count: 0, responses: 0 },
      'Startup': { size: 'Startup (1-50 employees)', count: 0, responses: 0 },
    };

    apps.forEach(a => {
      let sizeTier = 'Mid-size';
      if (a.companyId) {
        const sizeStr = a.companyId.size || '';
        if (sizeStr.includes('10000') || sizeStr.includes('1000+') || sizeStr.includes('5000')) {
          sizeTier = 'Enterprise';
        } else if (sizeStr.includes('1-10') || sizeStr.includes('11-50') || sizeStr.includes('1-50')) {
          sizeTier = 'Startup';
        }
      }

      sizeMap[sizeTier].count++;
      if (!['SAVED', 'APPLIED'].includes(a.status)) {
        sizeMap[sizeTier].responses++;
      }
    });

    const companyAnalysis = Object.values(sizeMap).map(c => ({
      sizeGroup: c.size,
      applications: c.count,
      responseRate: c.count > 0 ? Math.round((c.responses / c.count) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          total,
          active,
          interviews,
          offers,
          responseRate,
          interviewRate,
          offerRate,
          avgResponseDays,
        },
        funnel,
        weeklyTrend,
        sourceAnalysis,
        companyAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
};
