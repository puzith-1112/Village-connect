import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import jobsRouter from "./jobs.js";
import agricultureRouter from "./agriculture.js";
import healthcareRouter from "./healthcare.js";
import educationRouter from "./education.js";
import grievancesRouter from "./grievances.js";
import dashboardRouter from "./dashboard.js";
import environmentalRouter from "./environmental.js";
const router = Router();
router.use(healthRouter);
router.use(authRouter);
router.use(jobsRouter);
router.use(agricultureRouter);
router.use(healthcareRouter);
router.use(educationRouter);
router.use(grievancesRouter);
router.use(dashboardRouter);
router.use(environmentalRouter);
var stdin_default = router;
export {
  stdin_default as default
};
