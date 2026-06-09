import { Router, type IRouter } from "express";
import { eq, ilike } from "drizzle-orm";
import { db, candidatesTable } from "@workspace/db";
import {
  ListCandidatesQueryParams,
  ListCandidatesResponse,
  CreateCandidateBody,
  GetCandidateParams,
  GetCandidateResponse,
  UpdateCandidateParams,
  UpdateCandidateBody,
  UpdateCandidateResponse,
  DeleteCandidateParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/candidates", async (req, res): Promise<void> => {
  const query = ListCandidatesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(candidatesTable).$dynamic();
  if (query.data.search) {
    dbQuery = dbQuery.where(ilike(candidatesTable.name, `%${query.data.search}%`));
  }

  const candidates = await dbQuery.orderBy(candidatesTable.createdAt);
  res.json(ListCandidatesResponse.parse(candidates));
});

router.post("/candidates", async (req, res): Promise<void> => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [candidate] = await db.insert(candidatesTable).values(parsed.data).returning();
  res.status(201).json(GetCandidateResponse.parse(candidate));
});

router.get("/candidates/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCandidateParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  res.json(GetCandidateResponse.parse(candidate));
});

router.patch("/candidates/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateCandidateParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [candidate] = await db
    .update(candidatesTable)
    .set(parsed.data)
    .where(eq(candidatesTable.id, params.data.id))
    .returning();

  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  res.json(UpdateCandidateResponse.parse(candidate));
});

router.delete("/candidates/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteCandidateParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [candidate] = await db
    .delete(candidatesTable)
    .where(eq(candidatesTable.id, params.data.id))
    .returning();

  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
