import type { Request } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

export interface AuditLogEntry {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "READ";
  entity: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export const logAudit = async (entry: AuditLogEntry): Promise<void> => {
  try {
    await db.insert(auditLogsTable).values({
      id: uuidv4(),
      userId: entry.userId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      changes: entry.changes,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    });
  } catch (error) {
    logger.error({ error }, "Failed to log audit entry");
  }
};

export const getAuditContext = (req: Request) => {
  const userId = (req as any)?.auth?.userId || "system";
  const ipAddress = req.ip || req.socket?.remoteAddress || undefined;
  const userAgent = req.get("user-agent");

  return { userId, ipAddress, userAgent };
};

export const trackChange = (before: Record<string, unknown>, after: Record<string, unknown>) => {
  const changes: Record<string, { before: unknown; after: unknown }> = {};

  // Find changed fields
  Object.keys(after).forEach((key) => {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changes[key] = {
        before: before[key],
        after: after[key],
      };
    }
  });

  return changes;
};
