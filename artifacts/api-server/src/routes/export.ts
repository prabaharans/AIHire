import { Router, type IRouter } from "express";
import { db, applicationsTable, jobsTable, candidatesTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/errorHandler";
import { convertToCSV, convertToJSON } from "../lib/query-utils";

const router: IRouter = Router();

// Export applications
router.get(
  "/export/applications",
  asyncHandler(async (req, res) => {
    const format = (req.query.format as string) || "csv";
    const jobId = req.query.jobId as string | undefined;

    let query = db.select().from(applicationsTable);
    if (jobId) {
      query = query.where((col) => col.jobId === jobId);
    }

    const applications = await query;

    const columns = ["id", "jobId", "candidateName", "email", "stage", "appliedAt", "createdAt"];
    const exportData = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      candidateName: app.candidateName,
      email: app.email,
      stage: app.stage,
      appliedAt: app.appliedAt,
      createdAt: app.createdAt,
    }));

    const content = format === "json" ? convertToJSON(exportData) : convertToCSV(exportData, columns);
    const contentType = format === "json" ? "application/json" : "text/csv";
    const filename = `applications-${Date.now()}.${format}`;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(content);
  }),
);

// Export jobs
router.get(
  "/export/jobs",
  asyncHandler(async (_req, res) => {
    const jobs = await db.select().from(jobsTable);

    const columns = ["id", "title", "department", "status", "createdAt"];
    const exportData = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      department: job.department,
      status: job.status,
      createdAt: job.createdAt,
    }));

    const content = convertToCSV(exportData, columns);
    const filename = `jobs-${Date.now()}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(content);
  }),
);

// Export candidates
router.get(
  "/export/candidates",
  asyncHandler(async (_req, res) => {
    const candidates = await db.select().from(candidatesTable);

    const columns = ["id", "firstName", "lastName", "email", "phone", "status", "createdAt"];
    const exportData = candidates.map((candidate) => ({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      status: candidate.status,
      createdAt: candidate.createdAt,
    }));

    const content = convertToCSV(exportData, columns);
    const filename = `candidates-${Date.now()}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(content);
  }),
);

export default router;
