import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, applicationsTable, jobsTable, candidatesTable } from "@workspace/db";
import {
  ListApplicationsQueryParams,
  ListApplicationsResponse,
  CreateApplicationBody,
  GetApplicationParams,
  GetApplicationResponse,
  UpdateApplicationParams,
  UpdateApplicationBody,
  UpdateApplicationResponse,
  DeleteApplicationParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichApplication(app: typeof applicationsTable.$inferSelect) {
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, app.candidateId));
  return { ...app, job, candidate };
}

router.get("/applications", async (req, res): Promise<void> => {
  const query = ListApplicationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.jobId) conditions.push(eq(applicationsTable.jobId, query.data.jobId));
  if (query.data.stage) conditions.push(eq(applicationsTable.stage, query.data.stage));
  if (query.data.candidateId) conditions.push(eq(applicationsTable.candidateId, query.data.candidateId));

  const apps = await db
    .select()
    .from(applicationsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(applicationsTable.appliedAt);

  const enriched = await Promise.all(apps.map(enrichApplication));
  res.json(ListApplicationsResponse.parse(enriched));
});

router.post("/applications", async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [app] = await db.insert(applicationsTable).values(parsed.data).returning();
  const enriched = await enrichApplication(app);
  res.status(201).json(GetApplicationResponse.parse(enriched));
});

router.get("/applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetApplicationParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [app] = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.id, params.data.id));

  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const enriched = await enrichApplication(app);
  res.json(GetApplicationResponse.parse(enriched));
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateApplicationParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [app] = await db
    .update(applicationsTable)
    .set(parsed.data)
    .where(eq(applicationsTable.id, params.data.id))
    .returning();

  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const enriched = await enrichApplication(app);
  res.json(UpdateApplicationResponse.parse(enriched));
});

router.delete("/applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteApplicationParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [app] = await db
    .delete(applicationsTable)
    .where(eq(applicationsTable.id, params.data.id))
    .returning();

  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
