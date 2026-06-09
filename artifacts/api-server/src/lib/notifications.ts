import { db, notificationsTable, emailTemplatesTable } from "@workspace/db";
import { logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface EmailNotificationPayload {
  to: string;
  templateName: string;
  variables: Record<string, unknown>;
}

/**
 * Create an in-app notification
 */
export const createNotification = async (payload: NotificationPayload): Promise<void> => {
  try {
    await db.insert(notificationsTable).values({
      id: uuidv4(),
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      relatedEntityType: payload.relatedEntityType,
      relatedEntityId: payload.relatedEntityId,
    });
  } catch (error) {
    logger.error({ error }, "Failed to create notification");
  }
};

/**
 * Send an email notification
 */
export const sendEmailNotification = async (
  payload: EmailNotificationPayload,
): Promise<void> => {
  try {
    // Get the email template
    const template = await db.query.emailTemplatesTable.findFirst({
      where: (templates, { eq }) => eq(templates.name, payload.templateName),
    });

    if (!template) {
      logger.warn({ templateName: payload.templateName }, "Email template not found");
      return;
    }

    // Process template variables
    let emailBody = template.template;
    Object.entries(payload.variables).forEach(([key, value]) => {
      emailBody = emailBody.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    });

    // TODO: Integrate with email service (SendGrid, AWS SES, etc)
    logger.info(
      { to: payload.to, template: payload.templateName },
      "Email notification queued",
    );

    // In production, queue this to a job processor or call your email service
  } catch (error) {
    logger.error({ error }, "Failed to send email notification");
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (
  userId: string,
  limit: number = 10,
): Promise<unknown[]> => {
  try {
    return await db.query.notificationsTable.findMany({
      where: (notifications, { eq }) => eq(notifications.userId, userId),
      limit,
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
  } catch (error) {
    logger.error({ error }, "Failed to get notifications");
    return [];
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    // This would require an update function - implement based on your ORM
    logger.info({ notificationId }, "Marked notification as read");
  } catch (error) {
    logger.error({ error }, "Failed to mark notification as read");
  }
};

/**
 * Predefined notification types
 */
export const NotificationType = {
  APPLICATION_RECEIVED: "application_received",
  APPLICATION_REJECTED: "application_rejected",
  APPLICATION_ACCEPTED: "application_accepted",
  INTERVIEW_SCHEDULED: "interview_scheduled",
  INTERVIEW_COMPLETED: "interview_completed",
  JOB_POSTED: "job_posted",
  JOB_CLOSED: "job_closed",
  CANDIDATE_ADDED: "candidate_added",
} as const;
