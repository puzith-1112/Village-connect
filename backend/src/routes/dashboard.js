import { Router } from "express";
import { db, usersTable, jobsTable, agricultureTable, healthcareTable, educationTable, grievancesTable } from "../lib/db/index.js";
import { eq, count, desc } from "../lib/db/index.js";
import {
  GetDashboardSummaryResponse,
  GetRecentActivityResponse,
  GetGrievanceStatsResponse
} from "../lib/api-zod/index.js";
import { requireAuth } from "../lib/auth.js";
const router = Router();
router.get("/dashboard/summary", requireAuth, async (_req, res) => {
  const [totalUsers] = await db.select({ count: count() }).from(usersTable);
  const [totalJobs] = await db.select({ count: count() }).from(jobsTable);
  const [totalGrievances] = await db.select({ count: count() }).from(grievancesTable);
  const [resolvedGrievances] = await db.select({ count: count() }).from(grievancesTable).where(eq(grievancesTable.status, "resolved"));
  const [pendingGrievances] = await db.select({ count: count() }).from(grievancesTable).where(eq(grievancesTable.status, "pending"));
  const [totalAgriculture] = await db.select({ count: count() }).from(agricultureTable);
  const [totalHealthcare] = await db.select({ count: count() }).from(healthcareTable);
  const [totalEducation] = await db.select({ count: count() }).from(educationTable);
  res.json(GetDashboardSummaryResponse.parse({
    totalJobs: totalJobs?.count ?? 0,
    totalGrievances: totalGrievances?.count ?? 0,
    resolvedGrievances: resolvedGrievances?.count ?? 0,
    pendingGrievances: pendingGrievances?.count ?? 0,
    totalUsers: totalUsers?.count ?? 0,
    totalAgricultureEntries: totalAgriculture?.count ?? 0,
    totalHealthcareEntries: totalHealthcare?.count ?? 0,
    totalEducationEntries: totalEducation?.count ?? 0
  }));
});
router.get("/dashboard/recent-activity", requireAuth, async (_req, res) => {
  const recentJobs = await db.select({ id: jobsTable.id, title: jobsTable.title, createdAt: jobsTable.createdAt }).from(jobsTable).orderBy(desc(jobsTable.createdAt)).limit(5);
  const recentGrievances = await db.select({
    id: grievancesTable.id,
    title: grievancesTable.title,
    status: grievancesTable.status,
    updatedAt: grievancesTable.updatedAt,
    createdAt: grievancesTable.createdAt
  }).from(grievancesTable).orderBy(desc(grievancesTable.updatedAt)).limit(5);
  const activities = [
    ...recentJobs.map((j) => ({
      id: `job-${j.id}`,
      type: "job_posted",
      title: "New Job Posted",
      description: j.title,
      createdAt: j.createdAt
    })),
    ...recentGrievances.map((g) => ({
      id: `grievance-${g.id}`,
      type: g.status === "resolved" ? "grievance_resolved" : "grievance_submitted",
      title: g.status === "resolved" ? "Grievance Resolved" : "Grievance Submitted",
      description: g.title,
      createdAt: g.updatedAt
    }))
  ];
  activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json(GetRecentActivityResponse.parse(activities.slice(0, 10)));
});
router.get("/dashboard/grievance-stats", requireAuth, async (_req, res) => {
  const [pending] = await db.select({ count: count() }).from(grievancesTable).where(eq(grievancesTable.status, "pending"));
  const [inProgress] = await db.select({ count: count() }).from(grievancesTable).where(eq(grievancesTable.status, "in_progress"));
  const [resolved] = await db.select({ count: count() }).from(grievancesTable).where(eq(grievancesTable.status, "resolved"));
  res.json(GetGrievanceStatsResponse.parse({
    pending: pending?.count ?? 0,
    inProgress: inProgress?.count ?? 0,
    resolved: resolved?.count ?? 0
  }));
});
var stdin_default = router;
export {
  stdin_default as default
};
