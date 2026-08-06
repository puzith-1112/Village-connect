import { Router } from "express";
import { db, jobsTable, usersTable, Job, User } from "../lib/db/index.js";
import { eq, ilike, or, count, desc, and } from "../lib/db/index.js";
import {
  ListJobsQueryParams,
  CreateJobBody,
  GetJobParams,
  GetJobResponse,
  UpdateJobParams,
  UpdateJobBody,
  UpdateJobResponse,
  DeleteJobParams,
  ApplyJobParams,
  ApplyJobBody,
  ListJobApplicantsParams,
  ListJobApplicantsQueryParams,
  AssignJobParams
} from "../lib/api-zod/index.js";
import { requireAuth, requireRole } from "../lib/auth.js";
const router = Router();

function normalizeArray(values = []) {
  return [...new Set(values.map((item) => item.trim().toLowerCase()).filter(Boolean))];
}

function calculateRelevance(application, filters) {
  const appSkills = normalizeArray(application.skills ?? []);
  const appInterests = normalizeArray(application.interests ?? []);
  let score = appSkills.length + appInterests.length;

  if (filters.skill) {
    const requestedSkill = filters.skill.trim().toLowerCase();
    score += appSkills.includes(requestedSkill) ? 10 : 0;
  }
  if (filters.interest) {
    const requestedInterest = filters.interest.trim().toLowerCase();
    score += appInterests.includes(requestedInterest) ? 10 : 0;
  }

  return score;
}

router.get("/jobs", async (req, res) => {
  const parsed = ListJobsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, location, page = 1, limit = 10 } = parsed.data;
  const offset = (page - 1) * limit;
  let query = db.select({
    id: jobsTable.id,
    title: jobsTable.title,
    description: jobsTable.description,
    location: jobsTable.location,
    salary: jobsTable.salary,
    skillsRequired: jobsTable.skillsRequired,
    duration: jobsTable.duration,
    status: jobsTable.status,
    postedBy: jobsTable.postedBy,
    postedByName: usersTable.name,
    createdAt: jobsTable.createdAt
  }).from(jobsTable).leftJoin(usersTable, eq(jobsTable.postedBy, usersTable.id)).orderBy(desc(jobsTable.createdAt)).$dynamic();
  const conditions = [];
  if (search) conditions.push(or(ilike(jobsTable.title, `%${search}%`), ilike(jobsTable.description, `%${search}%`)));
  if (location) conditions.push(ilike(jobsTable.location, `%${location}%`));
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  const [totalResult] = await db.select({ count: count() }).from(jobsTable);
  const total = totalResult?.count ?? 0;
  const jobs = await query.limit(limit).offset(offset);
  res.json({
    data: jobs.map((j) => ({ ...j, postedByName: j.postedByName ?? "Unknown" })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
});
router.post("/jobs", requireAuth, requireRole("provider"), async (req, res) => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [job] = await db.insert(jobsTable).values({ ...parsed.data, postedBy: req.user.id }).returning();
  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, job.postedBy));
  res.status(201).json(GetJobResponse.parse({ ...job, status: job.status ?? "open", postedByName: user?.name ?? "Unknown" }));
});

router.get("/jobs/my-applications", requireAuth, requireRole("villager"), async (req, res) => {
  const jobs = await Job.find({ "applications.userId": req.user.id }).sort({ createdAt: -1 }).lean();
  const data = jobs.map((job) => {
    const currentApplication = (job.applications ?? []).find((application) => String(application.userId) === req.user.id);
    return {
      jobId: job._id,
      title: job.title,
      location: job.location,
      salary: job.salary,
      status: job.status ?? "open",
      appliedAt: currentApplication?.createdAt,
      applicationStatus: currentApplication?.status ?? "pending"
    };
  });
  res.json({
    total: data.length,
    data
  });
});

router.get("/jobs/:id", async (req, res) => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [job] = await db.select({
    id: jobsTable.id,
    title: jobsTable.title,
    description: jobsTable.description,
    location: jobsTable.location,
    salary: jobsTable.salary,
    skillsRequired: jobsTable.skillsRequired,
    duration: jobsTable.duration,
    status: jobsTable.status,
    postedBy: jobsTable.postedBy,
    postedByName: usersTable.name,
    createdAt: jobsTable.createdAt
  }).from(jobsTable).leftJoin(usersTable, eq(jobsTable.postedBy, usersTable.id)).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(GetJobResponse.parse({ ...job, status: job.status ?? "open", postedByName: job.postedByName ?? "Unknown" }));
});
router.put("/jobs/:id", requireAuth, requireRole("provider"), async (req, res) => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existingJob] = await db.select({
    id: jobsTable.id,
    postedBy: jobsTable.postedBy
  }).from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!existingJob) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  if (String(existingJob.postedBy) !== req.user.id) {
    res.status(403).json({ error: "You can only update jobs posted by you" });
    return;
  }
  const [job] = await db.update(jobsTable).set(parsed.data).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, job.postedBy));
  res.json(UpdateJobResponse.parse({ ...job, status: job.status ?? "open", postedByName: user?.name ?? "Unknown" }));
});

router.post("/jobs/:id/apply", requireAuth, requireRole("villager"), async (req, res) => {
  const params = ApplyJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ApplyJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const job = await Job.findById(params.data.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  if (job.status === "filled") {
    res.status(400).json({ error: "This job has already been filled" });
    return;
  }

  const hasAlreadyApplied = (job.applications ?? []).some((application) => String(application.userId) === req.user.id);
  if (hasAlreadyApplied) {
    res.status(409).json({ error: "You have already applied for this job" });
    return;
  }

  const payload = {
    userId: req.user.id,
    skills: normalizeArray(parsed.data.skills),
    interests: normalizeArray(parsed.data.interests),
    experience: parsed.data.experience?.trim() || undefined,
    status: "pending"
  };

  job.appliedBy = [...new Set([...(job.appliedBy ?? []).map((id) => String(id)), req.user.id])];
  job.applications = [...(job.applications ?? []), payload];
  await job.save();

  await User.findByIdAndUpdate(req.user.id, {
    $set: {
      skills: payload.skills,
      interests: payload.interests,
      ...(payload.experience ? { experience: payload.experience } : {})
    }
  });

  const createdApplication = job.applications[job.applications.length - 1];
  res.status(201).json({
    message: "Application submitted successfully",
    application: {
      applicationId: createdApplication._id,
      userId: createdApplication.userId,
      skills: createdApplication.skills,
      interests: createdApplication.interests,
      experience: createdApplication.experience,
      status: createdApplication.status,
      createdAt: createdApplication.createdAt
    }
  });
});

router.get("/jobs/:id/applicants", requireAuth, requireRole("admin", "provider"), async (req, res) => {
  const params = ListJobApplicantsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const query = ListJobApplicantsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const job = await Job.findById(params.data.id).lean();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (req.user.role === "provider" && String(job.postedBy) !== req.user.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const applications = job.applications ?? [];
  const userIds = [...new Set(applications.map((application) => String(application.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const usersMap = new Map(users.map((user) => [String(user._id), user]));

  let applicants = applications.map((application) => {
    const applicantUser = usersMap.get(String(application.userId));
    const skills = application.skills ?? applicantUser?.skills ?? [];
    const interests = application.interests ?? applicantUser?.interests ?? [];
    const relevanceScore = calculateRelevance({ skills, interests }, query.data);
    return {
      applicationId: application._id,
      userId: application.userId,
      name: applicantUser?.name ?? "Unknown Applicant",
      email: applicantUser?.email ?? "",
      skills,
      interests,
      experience: application.experience ?? applicantUser?.experience ?? "",
      employmentStatus: applicantUser?.employmentStatus ?? "unemployed",
      applicationStatus: application.status ?? "pending",
      relevanceScore,
      createdAt: application.createdAt
    };
  });

  if (query.data.skill) {
    const requestedSkill = query.data.skill.trim().toLowerCase();
    applicants = applicants.filter((item) => normalizeArray(item.skills).includes(requestedSkill));
  }

  if (query.data.interest) {
    const requestedInterest = query.data.interest.trim().toLowerCase();
    applicants = applicants.filter((item) => normalizeArray(item.interests).includes(requestedInterest));
  }

  if (query.data.sortBy === "experience") {
    applicants.sort((a, b) => (b.experience?.length ?? 0) - (a.experience?.length ?? 0));
  } else if (query.data.sortBy === "recent") {
    applicants.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    applicants.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  res.json({
    job: {
      id: job._id,
      title: job.title,
      status: job.status ?? "open"
    },
    totalApplicants: applicants.length,
    applicants
  });
});

router.patch("/jobs/:id/applicants/:applicationId/assign", requireAuth, requireRole("admin", "provider"), async (req, res) => {
  const params = AssignJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const job = await Job.findById(params.data.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (req.user.role === "provider" && String(job.postedBy) !== req.user.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const selectedApplication = (job.applications ?? []).find((application) => String(application._id) === params.data.applicationId);
  if (!selectedApplication) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  for (const application of job.applications ?? []) {
    application.status = String(application._id) === params.data.applicationId ? "selected" : "rejected";
  }

  job.status = "filled";
  job.assignedCandidate = selectedApplication.userId;
  await job.save();

  await User.findByIdAndUpdate(selectedApplication.userId, {
    $set: {
      employmentStatus: "employed",
      currentJobId: job._id
    }
  });

  const rejectedUserIds = (job.applications ?? []).filter((application) => String(application._id) !== params.data.applicationId).map((application) => application.userId);
  if (rejectedUserIds.length > 0) {
    await User.updateMany(
      { _id: { $in: rejectedUserIds }, currentJobId: job._id },
      {
        $set: {
          employmentStatus: "unemployed"
        },
        $unset: {
          currentJobId: 1
        }
      }
    );
  }

  res.json({
    message: "Applicant assigned successfully",
    jobId: job._id,
    status: job.status,
    selectedUserId: selectedApplication.userId,
    selectedApplicationId: selectedApplication._id,
    selectedApplicants: 1,
    rejectedApplicants: Math.max((job.applications?.length ?? 1) - 1, 0)
  });
});

router.delete("/jobs/:id", requireAuth, requireRole("provider"), async (req, res) => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [existingJob] = await db.select({
    id: jobsTable.id,
    postedBy: jobsTable.postedBy
  }).from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!existingJob) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  if (String(existingJob.postedBy) !== req.user.id) {
    res.status(403).json({ error: "You can only delete jobs posted by you" });
    return;
  }
  const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();
  res.sendStatus(204);
});
var stdin_default = router;
export {
  stdin_default as default
};
