import { Router, type IRouter } from "express";
import { requireAuth } from "@clerk/express";
import { asyncHandler } from "../middlewares/errorHandler";
import {
  getUserNotifications,
  createNotification,
  NotificationType,
} from "../lib/notifications";
import { getPaginationParams, createPaginatedResponse } from "../lib/pagination";

const router: IRouter = Router();

// Get user notifications
router.get(
  "/notifications",
  requireAuth(),
  asyncHandler(async (req, res) => {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { limit } = getPaginationParams(req);
    const notifications = await getUserNotifications(userId, limit);

    res.json({
      data: notifications,
      count: notifications.length,
    });
  }),
);

// Mark notification as read
router.put(
  "/notifications/:id/read",
  requireAuth(),
  asyncHandler(async (req, res) => {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Implementation would mark notification as read
    res.json({ success: true });
  }),
);

// Get notification preferences
router.get(
  "/notifications/preferences",
  requireAuth(),
  asyncHandler(async (req, res) => {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Return default preferences
    res.json({
      emailNotifications: true,
      inAppNotifications: true,
      dailyDigest: false,
      types: Object.values(NotificationType),
    });
  }),
);

// Update notification preferences
router.put(
  "/notifications/preferences",
  requireAuth(),
  asyncHandler(async (req, res) => {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { emailNotifications, inAppNotifications, dailyDigest } = req.body;

    // Implementation would update preferences in database
    res.json({
      success: true,
      preferences: {
        emailNotifications,
        inAppNotifications,
        dailyDigest,
      },
    });
  }),
);

export default router;
