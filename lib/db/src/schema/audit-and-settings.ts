import {
  pgTable,
  text,
  timestamp,
  jsonb,
  boolean,
  varchar,
  integer,
} from "drizzle-orm/pg-core";

/**
 * Audit log table for tracking all changes
 */
export const auditLogsTable = pgTable("audit_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  action: varchar("action").notNull(), // CREATE, UPDATE, DELETE, READ
  entity: varchar("entity").notNull(), // job, candidate, application, interview
  entityId: varchar("entity_id").notNull(),
  changes: jsonb("changes"), // Before and after values
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Notifications table for email and in-app notifications
 */
export const notificationsTable = pgTable("notifications", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // application_received, interview_scheduled, etc
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  relatedEntityType: varchar("related_entity_type"), // job, candidate, application
  relatedEntityId: varchar("related_entity_id"),
  read: boolean("read").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Email templates table for customizable email notifications
 */
export const emailTemplatesTable = pgTable("email_templates", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  subject: varchar("subject").notNull(),
  template: text("template").notNull(), // HTML template with {{placeholders}}
  variables: jsonb("variables"), // List of available variables
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * User preferences/settings table
 */
export const userSettingsTable = pgTable("user_settings", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  theme: varchar("theme").default("light"), // light, dark, auto
  emailNotifications: boolean("email_notifications").default(true),
  inAppNotifications: boolean("in_app_notifications").default(true),
  dailyDigest: boolean("daily_digest").default(false),
  language: varchar("language").default("en"),
  timezone: varchar("timezone").default("UTC"),
  preferences: jsonb("preferences"), // Additional custom preferences
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Activity feed table for user activity tracking
 */
export const activityFeedTable = pgTable("activity_feed", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  action: varchar("action").notNull(),
  description: text("description"),
  entityType: varchar("entity_type"),
  entityId: varchar("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
