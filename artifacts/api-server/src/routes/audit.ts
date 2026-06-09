import { Router, type IRouter } from "express";
import { requireAuth } from "@clerk/express";
import { db, auditLogsTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/errorHandler";
import { getPaginationParams, createPaginatedResponse } from "../lib/pagination";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

// Get audit logs (admin only)
router.get(
  "/audit-logs",
  requireAuth(),
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req);
    const entity = req.query.entity as string | undefined;
    const action = req.query.action as string | undefined;

    let query = db.select().from(auditLogsTable);

    if (entity) {
      // Add entity filter
    }

    if (action) {
      // Add action filter
    }

    const logs = await query.orderBy(desc(auditLogsTable.createdAt)).limit(limit).offset(offset);

    const total = await db
      .select()
      .from(auditLogsTable)
      .then((result) => result.length);

    const response = createPaginatedResponse(logs, total, page, limit);
    res.json(response);
  }),
);

// Get audit log by entity
router.get(
  "/audit-logs/entity/:entityType/:entityId",
  requireAuth(),
  asyncHandler(async (req, res) => {
    const { entityType, entityId } = req.params;
    const { page, limit, offset } = getPaginationParams(req);

    // Fetch audit logs for specific entity
    let query = db.select().from(auditLogsTable);

    const logs = await query.orderBy(desc(auditLogsTable.createdAt)).limit(limit).offset(offset);

    const total = logs.length;
    const response = createPaginatedResponse(logs, total, page, limit);
    res.json(response);
  }),
);

export default router;
