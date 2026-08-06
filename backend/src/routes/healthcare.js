import { Router } from "express";
import { db, healthcareTable } from "../lib/db/index.js";
import { eq, desc } from "../lib/db/index.js";
import {
  CreateHealthcareBody,
  UpdateHealthcareParams,
  UpdateHealthcareBody,
  UpdateHealthcareResponse,
  DeleteHealthcareParams
} from "../lib/api-zod/index.js";
import { requireAuth, requireRole } from "../lib/auth.js";
const router = Router();
router.get("/healthcare", async (_req, res) => {
  const items = await db.select().from(healthcareTable).orderBy(desc(healthcareTable.createdAt));
  res.json(items);
});
router.post("/healthcare", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateHealthcareBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(healthcareTable).values(parsed.data).returning();
  res.status(201).json(item);
});
router.put("/healthcare/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const params = UpdateHealthcareParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateHealthcareBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(healthcareTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(healthcareTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(UpdateHealthcareResponse.parse(item));
});
router.delete("/healthcare/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const params = DeleteHealthcareParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(healthcareTable).where(eq(healthcareTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.sendStatus(204);
});
var stdin_default = router;
export {
  stdin_default as default
};

