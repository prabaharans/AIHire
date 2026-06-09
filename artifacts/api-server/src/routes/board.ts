import { Router, type IRouter } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, jobsTable, candidatesTable, applicationsTable } from "@workspace/db";
import {
  ListBoardJobsQueryParams,
  ListBoardJobsResponse,
  GetBoardJobParams,
  GetBoardJobResponse,
  QuickApplyBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/board/jobs", async (req, res): Promise<void> => {
  const query = ListBoardJobsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [eq(jobsTable.status, "open")];

  if (query.data.department) {
    conditions.push(ilike(jobsTable.department, `%${query.data.department}%`));
  }
  if (query.data.type) {
    conditions.push(eq(jobsTable.type, query.data.type));
  }
  if (query.data.location) {
    conditions.push(ilike(jobsTable.location, `%${query.data.location}%`));
  }
  if (query.data.search) {
    conditions.push(ilike(jobsTable.title, `%${query.data.search}%`));
  }

  const jobs = await db
    .select()
    .from(jobsTable)
    .where(and(...conditions))
    .orderBy(jobsTable.createdAt);

  res.json(ListBoardJobsResponse.parse(jobs.map((j) => ({ ...j, createdAt: j.createdAt.toISOString() }))));
});

router.get("/board/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetBoardJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db
    .select()
    .from(jobsTable)
    .where(and(eq(jobsTable.id, params.data.id), eq(jobsTable.status, "open")));

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(GetBoardJobResponse.parse({ ...job, createdAt: job.createdAt.toISOString() }));
});

router.post("/board/apply", async (req, res): Promise<void> => {
  const parsed = QuickApplyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { jobId, name, email, phone, resumeUrl, linkedinUrl, coverLetter } = parsed.data;

  // Verify job exists and is open
  const [job] = await db
    .select()
    .from(jobsTable)
    .where(and(eq(jobsTable.id, jobId), eq(jobsTable.status, "open")));

  if (!job) {
    res.status(404).json({ error: "Job not found or no longer accepting applications" });
    return;
  }

  // Upsert candidate by email
  let candidate = (await db
    .select()
    .from(candidatesTable)
    .where(eq(candidatesTable.email, email)))[0];

  if (!candidate) {
    [candidate] = await db
      .insert(candidatesTable)
      .values({
        name,
        email,
        phone: phone ?? null,
        resumeUrl: resumeUrl ?? linkedinUrl ?? null,
        source: "Job Board",
        notes: coverLetter ? `Cover Letter: ${coverLetter}` : null,
      })
      .returning();
  }

  // Check for duplicate application
  const [existing] = await db
    .select()
    .from(applicationsTable)
    .where(
      and(
        eq(applicationsTable.jobId, jobId),
        eq(applicationsTable.candidateId, candidate.id)
      )
    );

  if (existing) {
    res.status(201).json({
      applicationId: existing.id,
      candidateId: candidate.id,
      message: "You have already applied for this position.",
      alreadyApplied: true,
    });
    return;
  }

  const [application] = await db
    .insert(applicationsTable)
    .values({
      jobId,
      candidateId: candidate.id,
      stage: "applied",
      notes: coverLetter ?? null,
    })
    .returning();

  res.status(201).json({
    applicationId: application.id,
    candidateId: candidate.id,
    message: "Your application has been submitted successfully!",
    alreadyApplied: false,
  });
});

export default router;
