import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, jobsTable, applicationsTable } from "@workspace/db";
import {
  ListJobsQueryParams,
  ListJobsResponse,
  CreateJobBody,
  GetJobParams,
  GetJobResponse,
  UpdateJobParams,
  UpdateJobBody,
  UpdateJobResponse,
  DeleteJobParams,
  GetJobsSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/jobs/summary", async (req, res): Promise<void> => {
  const jobs = await db.select().from(jobsTable).orderBy(jobsTable.createdAt);

  const summaries = await Promise.all(
    jobs.map(async (job) => {
      const counts = await db
        .select({
          stage: applicationsTable.stage,
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(applicationsTable)
        .where(eq(applicationsTable.jobId, job.id))
        .groupBy(applicationsTable.stage);

      const byStage: Record<string, number> = {
        applied: 0, screening: 0, interview: 0, offer: 0, hired: 0, rejected: 0,
      };
      counts.forEach(({ stage, count }) => { byStage[stage] = count; });
      const total = Object.values(byStage).reduce((a, b) => a + b, 0);

      return {
        id: job.id,
        title: job.title,
        department: job.department,
        status: job.status,
        totalApplications: total,
        applied: byStage.applied,
        screening: byStage.screening,
        interview: byStage.interview,
        offer: byStage.offer,
        hired: byStage.hired,
        rejected: byStage.rejected,
      };
    })
  );

  res.json(GetJobsSummaryResponse.parse(summaries));
});

router.get("/jobs", async (req, res): Promise<void> => {
  const query = ListJobsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(jobsTable).$dynamic();
  if (query.data.status) {
    dbQuery = dbQuery.where(eq(jobsTable.status, query.data.status));
  }

  const jobs = await dbQuery.orderBy(jobsTable.createdAt);
  res.json(ListJobsResponse.parse(jobs));
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db.insert(jobsTable).values(parsed.data).returning();
  res.status(201).json(GetJobResponse.parse(job));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(GetJobResponse.parse(job));
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db
    .update(jobsTable)
    .set(parsed.data)
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(UpdateJobResponse.parse(job));
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
