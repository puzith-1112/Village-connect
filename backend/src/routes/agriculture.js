import { Router } from "express";
import { db, agricultureTable } from "../lib/db/index.js";
import { eq, desc } from "../lib/db/index.js";
import {
  CreateAgricultureBody,
  UpdateAgricultureParams,
  UpdateAgricultureBody,
  UpdateAgricultureResponse,
  DeleteAgricultureParams
} from "../lib/api-zod/index.js";
import { requireAuth, requireRole } from "../lib/auth.js";
const router = Router();
router.get("/agriculture", async (_req, res) => {
  const items = await db.select().from(agricultureTable).orderBy(desc(agricultureTable.createdAt));
  res.json(items);
});
router.post("/agriculture", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateAgricultureBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(agricultureTable).values(parsed.data).returning();
  res.status(201).json(item);
});
router.put("/agriculture/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const params = UpdateAgricultureParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAgricultureBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(agricultureTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(agricultureTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(UpdateAgricultureResponse.parse(item));
});
router.delete("/agriculture/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const params = DeleteAgricultureParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(agricultureTable).where(eq(agricultureTable.id, params.data.id)).returning();
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

