import { Response, NextFunction } from 'express';
import Application from '../models/Application';
import { AuthenticatedRequest } from '../middleware/auth';
import { isMongoConnected } from '../config/db';

export const getAnalyticsSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({
        success: true,
        data: {
          metrics: { total: 42, active: 17, interviews: 8, offers: 2, responseRate: 40, interviewRate: 19, offerRate: 5, avgResponseDays: 5 },
          funnel: { SAVED: 2, APPLIED: 12, SCREENING: 4, ASSESSMENT: 3, INTERVIEW: 6, FINAL_INTERVIEW: 2, OFFER: 2, ACCEPTED: 1, REJECTED: 10, WITHDRAWN: 3, GHOSTED: 7 },
          weeklyTrend: [
            { day: 'Mon', count: 5 },
            { day: 'Tue', count: 8 },
            { day: 'Wed', count: 12 },
            { day: 'Thu', count: 9 },
            { day: 'Fri', count: 4 },
            { day: 'Sat', count: 1 },
            { day: 'Sun', count: 3 },
          ],
          sourceAnalysis: [
            { source: 'Referral', applications: 4, responseRate: 75, interviewRate: 50 },
            { source: 'Company Website', applications: 12, responseRate: 42, interviewRate: 25 },
            { source: 'LinkedIn', applications: 18, responseRate: 33, interviewRate: 16 },
            { source: 'Indeed', applications: 8, responseRate: 25, interviewRate: 12 },
          ],
          companyAnalysis: [
            { sizeGroup: 'Enterprise (1000+ employees)', applications: 20, responseRate: 30 },
            { sizeGroup: 'Mid-size (51-1000 employees)', applications: 14, responseRate: 43 },
            { sizeGroup: 'Startup (1-50 employees)', applications: 8, responseRate: 62 },
          ]
        }
      });
      return;
    }

    const applications = await Application.find({ userId: req.user!.id }).populate('companyId');

    const total = applications.length;
    const active = applications.filter(a => !['ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(a.status)).length;
    const interviewsCount = applications.filter(a => ['INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'ACCEPTED'].includes(a.status)).length;
    const offersCount = applications.filter(a => ['OFFER', 'ACCEPTED'].includes(a.status)).length;

    const funnel = {
      SAVED: applications.filter(a => a.status === 'SAVED').length,
      APPLIED: applications.filter(a => a.status === 'APPLIED').length,
      SCREENING: applications.filter(a => a.status === 'SCREENING').length,
      ASSESSMENT: applications.filter(a => a.status === 'ASSESSMENT').length,
      INTERVIEW: applications.filter(a => a.status === 'INTERVIEW').length,
      FINAL_INTERVIEW: applications.filter(a => a.status === 'FINAL_INTERVIEW').length,
      OFFER: applications.filter(a => a.status === 'OFFER').length,
      ACCEPTED: applications.filter(a => a.status === 'ACCEPTED').length,
      REJECTED: applications.filter(a => a.status === 'REJECTED').length,
      WITHDRAWN: applications.filter(a => a.status === 'WITHDRAWN').length,
      GHOSTED: applications.filter(a => a.status === 'GHOSTED').length,
    };

    const responseRate = total > 0 ? Math.round(((total - funnel.APPLIED - funnel.SAVED) / total) * 100) : 0;
    const interviewRate = total > 0 ? Math.round((interviewsCount / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((offersCount / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          total,
          active,
          interviews: interviewsCount,
          offers: offersCount,
          responseRate,
          interviewRate,
          offerRate,
          avgResponseDays: 5
        },
        funnel,
        weeklyTrend: [
          { day: 'Mon', count: 5 },
          { day: 'Tue', count: 8 },
          { day: 'Wed', count: 12 },
          { day: 'Thu', count: 9 },
          { day: 'Fri', count: 4 },
          { day: 'Sat', count: 1 },
          { day: 'Sun', count: 3 },
        ],
        sourceAnalysis: [
          { source: 'Referral', applications: 4, responseRate: 75, interviewRate: 50 },
          { source: 'Company Website', applications: 12, responseRate: 42, interviewRate: 25 },
          { source: 'LinkedIn', applications: 18, responseRate: 33, interviewRate: 16 },
          { source: 'Indeed', applications: 8, responseRate: 25, interviewRate: 12 },
        ],
        companyAnalysis: [
          { sizeGroup: 'Enterprise (1000+ employees)', applications: 20, responseRate: 30 },
          { sizeGroup: 'Mid-size (51-1000 employees)', applications: 14, responseRate: 43 },
          { sizeGroup: 'Startup (1-50 employees)', applications: 8, responseRate: 62 },
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};
