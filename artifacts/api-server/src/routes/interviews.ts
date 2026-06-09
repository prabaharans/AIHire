import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, interviewsTable } from "@workspace/db";
import {
  ListInterviewsQueryParams,
  ListInterviewsResponse,
  CreateInterviewBody,
  GetInterviewParams,
  GetInterviewResponse,
  UpdateInterviewParams,
  UpdateInterviewBody,
  UpdateInterviewResponse,
  DeleteInterviewParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/interviews", async (req, res): Promise<void> => {
  const query = ListInterviewsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.applicationId) conditions.push(eq(interviewsTable.applicationId, query.data.applicationId));
  if (query.data.status) conditions.push(eq(interviewsTable.status, query.data.status));

  const interviews = await db
    .select()
    .from(interviewsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(interviewsTable.scheduledAt);

  res.json(ListInterviewsResponse.parse(interviews));
});

router.post("/interviews", async (req, res): Promise<void> => {
  const parsed = CreateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = {
    ...parsed.data,
    scheduledAt: new Date(parsed.data.scheduledAt),
  };

  const [interview] = await db.insert(interviewsTable).values(data).returning();
  res.status(201).json(GetInterviewResponse.parse(interview));
});

router.get("/interviews/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetInterviewParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [interview] = await db
    .select()
    .from(interviewsTable)
    .where(eq(interviewsTable.id, params.data.id));

  if (!interview) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }

  res.json(GetInterviewResponse.parse(interview));
});

router.patch("/interviews/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateInterviewParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.scheduledAt) {
    updateData.scheduledAt = new Date(parsed.data.scheduledAt);
  }

  const [interview] = await db
    .update(interviewsTable)
    .set(updateData)
    .where(eq(interviewsTable.id, params.data.id))
    .returning();

  if (!interview) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }

  res.json(UpdateInterviewResponse.parse(interview));
});

router.delete("/interviews/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteInterviewParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [interview] = await db
    .delete(interviewsTable)
    .where(eq(interviewsTable.id, params.data.id))
    .returning();

  if (!interview) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
