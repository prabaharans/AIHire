import { Router, type IRouter } from "express";
import { eq, sql, and, gte } from "drizzle-orm";
import { db, jobsTable, candidatesTable, applicationsTable } from "@workspace/db";
import {
  GetDashboardStatsResponse,
  GetPipelineOverviewResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [totalJobsRow] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(jobsTable);
  const [openJobsRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(jobsTable)
    .where(eq(jobsTable.status, "open"));
  const [totalCandidatesRow] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(candidatesTable);
  const [totalAppsRow] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(applicationsTable);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const [hiredRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(applicationsTable)
    .where(
      and(
        eq(applicationsTable.stage, "hired"),
        gte(applicationsTable.updatedAt, startOfMonth)
      )
    );

  const stageCounts = await db
    .select({
      stage: applicationsTable.stage,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(applicationsTable)
    .groupBy(applicationsTable.stage);

  const stats = {
    totalJobs: totalJobsRow?.count ?? 0,
    openJobs: openJobsRow?.count ?? 0,
    totalCandidates: totalCandidatesRow?.count ?? 0,
    totalApplications: totalAppsRow?.count ?? 0,
    hiredThisMonth: hiredRow?.count ?? 0,
    applicationsByStage: stageCounts.map((s) => ({ stage: s.stage, count: s.count })),
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/dashboard/pipeline", async (_req, res): Promise<void> => {
  const stageCounts = await db
    .select({
      stage: applicationsTable.stage,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(applicationsTable)
    .groupBy(applicationsTable.stage);

  const byStage: Record<string, number> = {
    applied: 0, screening: 0, interview: 0, offer: 0, hired: 0, rejected: 0,
  };
  stageCounts.forEach(({ stage, count }) => { byStage[stage] = count; });

  res.json(
    GetPipelineOverviewResponse.parse({
      applied: byStage.applied,
      screening: byStage.screening,
      interview: byStage.interview,
      offer: byStage.offer,
      hired: byStage.hired,
      rejected: byStage.rejected,
    })
  );
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const recentApps = await db
    .select({
      id: applicationsTable.id,
      stage: applicationsTable.stage,
      updatedAt: applicationsTable.updatedAt,
      candidateId: applicationsTable.candidateId,
      jobId: applicationsTable.jobId,
    })
    .from(applicationsTable)
    .orderBy(sql`${applicationsTable.updatedAt} DESC`)
    .limit(20);

  const activities = await Promise.all(
    recentApps.map(async (app) => {
      const [candidate] = await db
        .select({ name: candidatesTable.name })
        .from(candidatesTable)
        .where(eq(candidatesTable.id, app.candidateId));

      const [job] = await db
        .select({ title: jobsTable.title })
        .from(jobsTable)
        .where(eq(jobsTable.id, app.jobId));

      const stageLabels: Record<string, string> = {
        applied: "applied for",
        screening: "moved to screening for",
        interview: "scheduled for interview for",
        offer: "received offer for",
        hired: "was hired for",
        rejected: "was rejected from",
      };

      return {
        id: app.id,
        type: app.stage,
        description: `${candidate?.name ?? "Unknown"} ${stageLabels[app.stage] ?? "updated status for"} ${job?.title ?? "a position"}`,
        candidateName: candidate?.name ?? null,
        jobTitle: job?.title ?? null,
        createdAt: app.updatedAt.toISOString(),
      };
    })
  );

  res.json(GetRecentActivityResponse.parse(activities));
});

export default router;
