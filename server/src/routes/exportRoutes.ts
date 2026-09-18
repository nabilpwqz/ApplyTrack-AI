import { Request, Response, Router } from 'express';
import { prisma } from '../db';

export const exportRouter = Router();

// Health check endpoint
exportRouter.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'unavailable';
  }

  res.json({
    status: 'ok',
    system: 'ApplyTrack AI Studio Server',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// JSON Full Export
exportRouter.get('/export/json', async (_req: Request, res: Response) => {
  try {
    const [applications, emailImports, careerGoals, networkContacts, storyBank] = await Promise.all([
      prisma.application.findMany({ include: { timeline: true } }),
      prisma.emailImport.findMany({}),
      prisma.careerGoal.findFirst({}),
      prisma.networkContact.findMany({}),
      prisma.story.findMany({}),
    ]);

    const backupPayload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      applications,
      emailImports,
      careerGoals: careerGoals || { weeklyApplications: 5, weeklyInterviews: 2 },
      networkContacts,
      storyBank,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="applytrack-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    res.send(JSON.stringify(backupPayload, null, 2));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate JSON export', details: String(error) });
  }
});

// CSV Export
exportRouter.get('/export/csv', async (_req: Request, res: Response) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { id: 'asc' },
    });

    const headers = [
      'ID', 'Company', 'Title', 'Status', 'Priority', 'Work Mode',
      'Location', 'Salary Min', 'Salary Max', 'Application Date',
      'Deadline', 'Source', 'Recruiter', 'Recruiter Email', 'Tags'
    ];

    const escapeCsv = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = applications.map((a) => [
      a.id,
      escapeCsv(a.company),
      escapeCsv(a.title),
      escapeCsv(a.status),
      escapeCsv(a.priority),
      escapeCsv(a.workMode),
      escapeCsv(a.location),
      a.salaryMin || 0,
      a.salaryMax || 0,
      escapeCsv(a.applicationDate),
      escapeCsv(a.deadline),
      escapeCsv(a.source),
      escapeCsv(a.recruiterName),
      escapeCsv(a.recruiterEmail),
      escapeCsv((a.tags || []).join('; ')),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="applytrack-applications-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate CSV export', details: String(error) });
  }
});

// JSON Import
exportRouter.post('/import/json', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ error: 'Invalid JSON payload' });
      return;
    }

    const apps = Array.isArray(payload.applications) ? payload.applications : [];
    for (const item of apps) {
      if (!item.company || !item.title) continue;
      await prisma.application.create({
        data: {
          company: item.company,
          title: item.title,
          url: item.url || null,
          location: item.location || null,
          workMode: item.workMode || null,
          employmentType: item.employmentType || null,
          salaryMin: item.salaryMin || 0,
          salaryMax: item.salaryMax || 0,
          applicationDate: item.applicationDate || new Date().toISOString().split('T')[0],
          deadline: item.deadline || null,
          source: item.source || null,
          priority: item.priority || 'Medium',
          status: item.status || 'saved',
          notes: item.notes || null,
          recruiterName: item.recruiterName || null,
          recruiterEmail: item.recruiterEmail || null,
          resumeVersion: item.resumeVersion || null,
          tags: Array.isArray(item.tags) ? item.tags : [],
        },
      });
    }

    res.json({ success: true, importedApplications: apps.length });
  } catch (error) {
    res.status(500).json({ error: 'Import failed', details: String(error) });
  }
});
