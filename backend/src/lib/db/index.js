import { connectDB } from "./connection.js";
import { Environmental } from "./models.js";
import {
  User,
  Job,
  Agriculture,
  Healthcare,
  Education,
  Grievance,
  db,
  usersTable,
  jobsTable,
  agricultureTable,
  healthcareTable,
  educationTable,
  grievancesTable,
  eq,
  ilike,
  and,
  or,
  desc,
  count
} from "./adapter.js";

const demoAdmin = {
  name: "Demo Admin",
  email: "admin@villageconnnect.in",
  password: "admin123",
  role: "admin"
};

async function seedDemoAdmin() {
  const existingAdmin = await User.findOne({ email: demoAdmin.email });

  if (!existingAdmin) {
    await User.create(demoAdmin);
    return;
  }

  let shouldSave = false;
  if (existingAdmin.name !== demoAdmin.name) {
    existingAdmin.name = demoAdmin.name;
    shouldSave = true;
  }
  if (existingAdmin.role !== demoAdmin.role) {
    existingAdmin.role = demoAdmin.role;
    shouldSave = true;
  }

  const hasDemoPassword = await existingAdmin.comparePassword(demoAdmin.password);
  if (!hasDemoPassword) {
    existingAdmin.password = demoAdmin.password;
    shouldSave = true;
  }

  if (shouldSave) {
    await existingAdmin.save();
  }
}

async function initializeDB() {
  await connectDB();
  await seedDemoAdmin();
}
export {
  Agriculture,
  Education,
  Environmental,
  Grievance,
  Healthcare,
  Job,
  User,
  agricultureTable,
  and,
  count,
  db,
  desc,
  educationTable,
  eq,
  grievancesTable,
  healthcareTable,
  ilike,
  initializeDB,
  jobsTable,
  or,
  usersTable
};
