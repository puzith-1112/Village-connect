import app from "./app.js";
import { logger } from "./lib/logger.js";
import { initializeDB } from "./lib/db/index.js";
const rawPort = process.env["PORT"] ?? "8001";
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}
await initializeDB();
app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info(`Server is running on port ${port}`);
});
