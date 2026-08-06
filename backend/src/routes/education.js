import { Router } from "express";
import { db, educationTable } from "../lib/db/index.js";
import { eq, desc } from "../lib/db/index.js";
import {
  CreateEducationBody,
  UpdateEducationParams,
  UpdateEducationBody,
  UpdateEducationResponse,
  DeleteEducationParams
} from "../lib/api-zod/index.js";
import { requireAuth, requireRole } from "../lib/auth.js";
const router = Router();
router.get("/education", async (_req, res) => {
  const items = await db.select().from(educationTable).orderBy(desc(educationTable.createdAt));
  res.json(items);
});
router.post("/education", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateEducationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(educationTable).values(parsed.data).returning();
  res.status(201).json(item);
});
router.put("/education/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const params = UpdateEducationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateEducationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(educationTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(educationTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(UpdateEducationResponse.parse(item));
});
router.delete("/education/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const params = DeleteEducationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(educationTable).where(eq(educationTable.id, params.data.id)).returning();
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

