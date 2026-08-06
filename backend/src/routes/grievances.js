import { Router } from "express";
import { db, grievancesTable, usersTable } from "../lib/db/index.js";
import { eq, desc, and, count } from "../lib/db/index.js";
import {
  ListGrievancesQueryParams,
  CreateGrievanceBody,
  GetGrievanceParams,
  GetGrievanceResponse,
  UpdateGrievanceStatusParams,
  UpdateGrievanceStatusBody,
  UpdateGrievanceStatusResponse
} from "../lib/api-zod/index.js";
import { requireAuth, requireRole } from "../lib/auth.js";
const router = Router();
router.get("/grievances", requireAuth, async (req, res) => {
  const parsed = ListGrievancesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { page = 1, limit = 10 } = parsed.data;
  const offset = (page - 1) * limit;
  const isAdmin = req.user.role === "admin";
  const whereClause = isAdmin ? void 0 : eq(grievancesTable.userId, req.user.id);
  const baseQuery = db.select({
    id: grievancesTable.id,
    userId: grievancesTable.userId,
    userName: usersTable.name,
    title: grievancesTable.title,
    description: grievancesTable.description,
    status: grievancesTable.status,
    adminResponse: grievancesTable.adminResponse,
    createdAt: grievancesTable.createdAt,
    updatedAt: grievancesTable.updatedAt
  }).from(grievancesTable).leftJoin(usersTable, eq(grievancesTable.userId, usersTable.id)).orderBy(desc(grievancesTable.createdAt)).$dynamic();
  const countQuery = db.select({ count: count() }).from(grievancesTable).$dynamic();
  const grievances = await (whereClause ? baseQuery.where(whereClause).limit(limit).offset(offset) : baseQuery.limit(limit).offset(offset));
  const [totalResult] = await (whereClause ? countQuery.where(whereClause) : countQuery);
  const total = totalResult?.count ?? 0;
  res.json({
    data: grievances.map((g) => ({ ...g, userName: g.userName ?? "Unknown" })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
});
router.post("/grievances", requireAuth, async (req, res) => {
  const parsed = CreateGrievanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [grievance] = await db.insert(grievancesTable).values({ ...parsed.data, userId: req.user.id }).returning();
  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, grievance.userId));
  res.status(201).json(GetGrievanceResponse.parse({ ...grievance, userName: user?.name ?? "Unknown" }));
});
router.get("/grievances/:id", requireAuth, async (req, res) => {
  const params = GetGrievanceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [grievance] = await db.select({
    id: grievancesTable.id,
    userId: grievancesTable.userId,
    userName: usersTable.name,
    title: grievancesTable.title,
    description: grievancesTable.description,
    status: grievancesTable.status,
    adminResponse: grievancesTable.adminResponse,
    createdAt: grievancesTable.createdAt,
    updatedAt: grievancesTable.updatedAt
  }).from(grievancesTable).leftJoin(usersTable, eq(grievancesTable.userId, usersTable.id)).where(eq(grievancesTable.id, params.data.id));
  if (!grievance) {
    res.status(404).json({ error: "Grievance not found" });
    return;
  }
  const isAdmin = req.user.role === "admin";
  if (!isAdmin && String(grievance.userId) !== String(req.user.id)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  res.json(GetGrievanceResponse.parse({ ...grievance, userName: grievance.userName ?? "Unknown" }));
});
router.put("/grievances/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const params = UpdateGrievanceStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateGrievanceStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [grievance] = await db.update(grievancesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(grievancesTable.id, params.data.id)).returning();
  if (!grievance) {
    res.status(404).json({ error: "Grievance not found" });
    return;
  }
  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, grievance.userId));
  res.json(UpdateGrievanceStatusResponse.parse({ ...grievance, userName: user?.name ?? "Unknown" }));
});
var stdin_default = router;
export {
  stdin_default as default
};

