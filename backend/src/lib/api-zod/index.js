import { z } from "zod";
const objectIdRegex = /^[a-fA-F0-9]{24}$/;
const idParam = z.object({ id: z.string().trim().regex(objectIdRegex, "Invalid id") });
const pageParam = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10)
});
const stringOptional = z.string().trim().optional();
const nullableString = z.union([z.string(), z.null()]).optional();
const RegisterBody = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["villager", "provider", "admin"]).default("villager"),
  phone: nullableString,
  address: nullableString,
  city: nullableString,
  state: nullableString,
  pincode: nullableString,
  skills: z.array(z.string().trim().min(1)).default([]),
  interests: z.array(z.string().trim().min(1)).default([]),
  experience: nullableString
});
const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
const GetMeResponse = z.any();
const HealthCheckResponse = z.object({ status: z.string() });
const ListJobsQueryParams = z.object({
  search: stringOptional,
  location: stringOptional,
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10)
});
const CreateJobBody = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  location: z.string().trim().min(1),
  salary: z.string().trim().min(1),
  skillsRequired: z.array(z.string().trim().min(1)).default([]),
  duration: z.string().trim().min(1)
});
const GetJobParams = idParam;
const UpdateJobParams = idParam;
const DeleteJobParams = idParam;
const ApplyJobParams = idParam;
const ApplyJobBody = z.object({
  skills: z.array(z.string().trim().min(1)).default([]),
  interests: z.array(z.string().trim().min(1)).default([]),
  experience: z.string().trim().optional()
});
const ListJobApplicantsParams = idParam;
const ListJobApplicantsQueryParams = z.object({
  skill: stringOptional,
  interest: stringOptional,
  sortBy: z.enum(["relevance", "experience", "recent"]).optional().default("relevance")
});
const AssignJobParams = z.object({
  id: z.string().trim().regex(objectIdRegex, "Invalid id"),
  applicationId: z.string().trim().regex(objectIdRegex, "Invalid application id")
});
const GetJobResponse = z.any();
const UpdateJobBody = CreateJobBody.partial();
const UpdateJobResponse = z.any();
const CreateAgricultureBody = z.object({
  tips: z.string().trim().min(1),
  schemes: z.string().trim().min(1),
  title: z.string().trim().min(1).optional(),
  category: z.enum(["tip", "scheme", "news"]).optional(),
  content: z.string().trim().min(1).optional(),
  imageUrl: nullableString
});
const UpdateAgricultureParams = idParam;
const UpdateAgricultureBody = CreateAgricultureBody.partial();
const UpdateAgricultureResponse = z.any();
const DeleteAgricultureParams = idParam;
const CreateHealthcareBody = z.object({
  information: z.string().trim().min(1),
  services: z.string().trim().min(1),
  title: z.string().trim().min(1).optional(),
  category: z.enum(["information", "service", "scheme"]).optional(),
  content: z.string().trim().min(1).optional(),
  contactInfo: nullableString,
  imageUrl: nullableString
});
const UpdateHealthcareParams = idParam;
const UpdateHealthcareBody = CreateHealthcareBody.partial();
const UpdateHealthcareResponse = z.any();
const DeleteHealthcareParams = idParam;
const CreateEducationBody = z.object({
  resources: z.string().trim().min(1),
  courses: z.string().trim().min(1),
  title: z.string().trim().min(1).optional(),
  category: z.enum(["course", "resource", "scholarship"]).optional(),
  content: z.string().trim().min(1).optional(),
  link: nullableString,
  imageUrl: nullableString
});
const UpdateEducationParams = idParam;
const UpdateEducationBody = CreateEducationBody.partial();
const UpdateEducationResponse = z.any();
const DeleteEducationParams = idParam;
const ListGrievancesQueryParams = pageParam;
const CreateGrievanceBody = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1)
});
const GetGrievanceParams = idParam;
const GetGrievanceResponse = z.any();
const UpdateGrievanceStatusParams = idParam;
const UpdateGrievanceStatusBody = z.object({
  status: z.enum(["pending", "in_progress", "resolved"]),
  adminResponse: z.string().trim().optional()
});
const UpdateGrievanceStatusResponse = z.any();
const GetDashboardSummaryResponse = z.any();
const GetRecentActivityResponse = z.any();
const GetGrievanceStatsResponse = z.any();
export {
  ApplyJobBody,
  ApplyJobParams,
  AssignJobParams,
  CreateAgricultureBody,
  CreateEducationBody,
  CreateGrievanceBody,
  CreateHealthcareBody,
  CreateJobBody,
  DeleteAgricultureParams,
  DeleteEducationParams,
  DeleteHealthcareParams,
  DeleteJobParams,
  GetDashboardSummaryResponse,
  GetGrievanceParams,
  GetGrievanceResponse,
  GetGrievanceStatsResponse,
  GetJobParams,
  GetJobResponse,
  GetMeResponse,
  GetRecentActivityResponse,
  HealthCheckResponse,
  ListGrievancesQueryParams,
  ListJobApplicantsParams,
  ListJobApplicantsQueryParams,
  ListJobsQueryParams,
  LoginBody,
  RegisterBody,
  UpdateAgricultureBody,
  UpdateAgricultureParams,
  UpdateAgricultureResponse,
  UpdateEducationBody,
  UpdateEducationParams,
  UpdateEducationResponse,
  UpdateGrievanceStatusBody,
  UpdateGrievanceStatusParams,
  UpdateGrievanceStatusResponse,
  UpdateHealthcareBody,
  UpdateHealthcareParams,
  UpdateHealthcareResponse,
  UpdateJobBody,
  UpdateJobParams,
  UpdateJobResponse
};
