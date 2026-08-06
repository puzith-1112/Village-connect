import { Router } from "express";
import { Environmental } from "../lib/db/index.js";
import { requireAuth, requireRole } from "../lib/auth.js";
const router = Router();
router.get("/environmental", async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };
    const total = await Environmental.countDocuments(filter);
    const items = await Environmental.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean();
    res.json({
      data: items,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching environmental content:", error.message);
    res.status(500).json({ error: error.message });
  }
});
router.get("/environmental/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Environmental.findById(id);
    if (!item) {
      res.status(404).json({ error: "Environmental content not found" });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching environmental content:", error.message);
    res.status(500).json({ error: error.message });
  }
});
router.post("/environmental", requireAuth, requireRole("admin", "provider"), async (req, res) => {
  try {
    const { title, description, category, content, imageUrl, resources } = req.body;
    if (!title || !category) {
      res.status(400).json({ error: "Title and category are required" });
      return;
    }
    const validCategories = ["soil", "water", "air", "climate", "renewable", "waste", "biodiversity"];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(", ")}` });
      return;
    }
    const newItem = await Environmental.create({
      title,
      description,
      category,
      content,
      imageUrl,
      resources: resources || [],
      providerId: req.user.id
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating environmental content:", error.message);
    res.status(500).json({ error: error.message });
  }
});
router.patch("/environmental/:id", requireAuth, requireRole("admin", "provider"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, content, imageUrl, resources } = req.body;
    const item = await Environmental.findById(id);
    if (!item) {
      res.status(404).json({ error: "Environmental content not found" });
      return;
    }
    if (item.providerId.toString() !== req.user.id && req.user.role !== "admin") {
      res.status(403).json({ error: "Not authorized to update this content" });
      return;
    }
    if (title) item.title = title;
    if (description) item.description = description;
    if (category) {
      const validCategories = ["soil", "water", "air", "climate", "renewable", "waste", "biodiversity"];
      if (!validCategories.includes(category)) {
        res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(", ")}` });
        return;
      }
      item.category = category;
    }
    if (content) item.content = content;
    if (imageUrl) item.imageUrl = imageUrl;
    if (resources) item.resources = resources;
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating environmental content:", error.message);
    res.status(500).json({ error: error.message });
  }
});
router.delete("/environmental/:id", requireAuth, requireRole("admin", "provider"), async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Environmental.findById(id);
    if (!item) {
      res.status(404).json({ error: "Environmental content not found" });
      return;
    }
    if (item.providerId.toString() !== req.user.id && req.user.role !== "admin") {
      res.status(403).json({ error: "Not authorized to delete this content" });
      return;
    }
    await Environmental.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting environmental content:", error.message);
    res.status(500).json({ error: error.message });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
