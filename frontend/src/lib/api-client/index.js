import { useMutation, useQuery } from "@tanstack/react-query";
let getAuthToken = () => localStorage.getItem("village_token");
function setAuthTokenGetter(getter) {
  getAuthToken = getter;
}
const apiBase = `${import.meta.env.VITE_API_URL ?? "http://localhost:8001"}/api`;
function compactParams(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== void 0 && value !== null && value !== ""));
}
function stableKey(name, params = {}) {
  return [name, JSON.stringify(compactParams(params))];
}
function normalizeHookArgs(vars, hookOptions) {
  if (hookOptions === void 0 && vars && typeof vars === "object" && "query" in vars) {
    return [{}, vars];
  }
  return [vars ?? {}, hookOptions ?? {}];
}
async function request(path, { method = "GET", data, params, auth = false } = {}) {
  const url = new URL(`${apiBase}${path}`);
  const query = compactParams(params);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, String(value));
  }
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAuthToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : void 0
  });
  if (response.status === 204) return null;
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(payload?.error ?? `Request failed with status ${response.status}`);
    error.data = payload;
    throw error;
  }
  return payload;
}
function createQueryHook(name, path, buildParams = (vars) => vars ?? {}, options = {}) {
  return function useGeneratedQuery(vars = {}, hookOptions = {}) {
    const [resolvedVars, resolvedHookOptions] = normalizeHookArgs(vars, hookOptions);
    const queryKey = resolvedHookOptions?.query?.queryKey ?? stableKey(name, buildParams(resolvedVars));
    return useQuery({
      queryKey,
      queryFn: () => request(path, { params: buildParams(resolvedVars), auth: options.auth ?? false }),
      ...resolvedHookOptions?.query
    });
  };
}
function createPathQueryHook(name, pathBuilder, buildParams = (vars) => vars ?? {}, options = {}) {
  return function useGeneratedQuery(vars = {}, hookOptions = {}) {
    const [resolvedVars, resolvedHookOptions] = normalizeHookArgs(vars, hookOptions);
    const queryKey = resolvedHookOptions?.query?.queryKey ?? stableKey(name, buildParams(resolvedVars));
    return useQuery({
      queryKey,
      queryFn: () => request(pathBuilder(resolvedVars), { auth: options.auth ?? false }),
      ...resolvedHookOptions?.query
    });
  };
}
function createPathQueryWithParamsHook(name, pathBuilder, buildParams = (vars) => vars ?? {}, options = {}) {
  return function useGeneratedQuery(vars = {}, hookOptions = {}) {
    const [resolvedVars, resolvedHookOptions] = normalizeHookArgs(vars, hookOptions);
    const queryParams = buildParams(resolvedVars);
    const queryKey = resolvedHookOptions?.query?.queryKey ?? stableKey(name, queryParams);
    return useQuery({
      queryKey,
      queryFn: () => request(pathBuilder(resolvedVars), { params: queryParams, auth: options.auth ?? false }),
      ...resolvedHookOptions?.query
    });
  };
}
function createMutationHook(pathBuilder, method, options = {}) {
  return function useGeneratedMutation(hookOptions = {}) {
    return useMutation({
      mutationFn: (vars) => request(pathBuilder(vars), { method, data: vars?.data, auth: options.auth ?? true }),
      ...hookOptions?.mutation
    });
  };
}
const getGetDashboardSummaryQueryKey = () => stableKey("getDashboardSummary");
const getGetRecentActivityQueryKey = () => stableKey("getRecentActivity");
const getGetGrievanceStatsQueryKey = () => stableKey("getGrievanceStats");
const getListJobsQueryKey = (params = {}) => stableKey("listJobs", params);
const getGetJobQueryKey = (params = {}) => stableKey("getJob", params);
const getListMyJobApplicationsQueryKey = () => stableKey("listMyJobApplications");
const getListJobApplicantsQueryKey = (params = {}) => stableKey("listJobApplicants", params);
const getListAgricultureQueryKey = () => stableKey("listAgriculture");
const getListHealthcareQueryKey = () => stableKey("listHealthcare");
const getListEducationQueryKey = () => stableKey("listEducation");
const getListEnvironmentalQueryKey = (params = {}) => stableKey("listEnvironmental", params);
const getGetEnvironmentalQueryKey = (params = {}) => stableKey("getEnvironmental", params);
const getListGrievancesQueryKey = (params = {}) => stableKey("listGrievances", params);
const getGetGrievanceQueryKey = (params = {}) => stableKey("getGrievance", params);
const useGetMe = createQueryHook("getMe", "/auth/me", () => ({}), { auth: true });
const useLogin = createMutationHook(() => "/auth/login", "POST", { auth: false });
const useRegister = createMutationHook(() => "/auth/register", "POST", { auth: false });
const useGetDashboardSummary = createQueryHook("getDashboardSummary", "/dashboard/summary", () => ({}), { auth: true });
const useGetRecentActivity = createQueryHook("getRecentActivity", "/dashboard/recent-activity", () => ({}), { auth: true });
const useGetGrievanceStats = createQueryHook("getGrievanceStats", "/dashboard/grievance-stats", () => ({}), { auth: true });
const useListJobs = createQueryHook("listJobs", "/jobs", (vars = {}) => vars, { auth: false });
const useGetJob = createPathQueryHook("getJob", (vars = {}) => `/jobs/${vars.id}`, (vars = {}) => ({ id: vars.id }), { auth: false });
const useListMyJobApplications = createQueryHook("listMyJobApplications", "/jobs/my-applications", () => ({}), { auth: true });
const useCreateJob = createMutationHook(() => "/jobs", "POST");
const useApplyForJob = createMutationHook((vars) => `/jobs/${vars.id}/apply`, "POST", { auth: true });
const useListJobApplicants = createPathQueryWithParamsHook(
  "listJobApplicants",
  (vars = {}) => `/jobs/${vars.id}/applicants`,
  (vars = {}) => ({ id: vars.id, skill: vars.skill, interest: vars.interest, sortBy: vars.sortBy }),
  { auth: true }
);
const useAssignJob = createMutationHook((vars) => `/jobs/${vars.id}/applicants/${vars.applicationId}/assign`, "PATCH", { auth: true });
const useListAgriculture = createQueryHook("listAgriculture", "/agriculture", () => ({}), { auth: false });
const useCreateAgriculture = createMutationHook(() => "/agriculture", "POST");
const useUpdateAgriculture = createMutationHook((vars) => `/agriculture/${vars.id}`, "PUT");
const useDeleteAgriculture = createMutationHook((vars) => `/agriculture/${vars.id}`, "DELETE");
const useListHealthcare = createQueryHook("listHealthcare", "/healthcare", () => ({}), { auth: false });
const useCreateHealthcare = createMutationHook(() => "/healthcare", "POST");
const useUpdateHealthcare = createMutationHook((vars) => `/healthcare/${vars.id}`, "PUT");
const useDeleteHealthcare = createMutationHook((vars) => `/healthcare/${vars.id}`, "DELETE");
const useListEducation = createQueryHook("listEducation", "/education", () => ({}), { auth: false });
const useCreateEducation = createMutationHook(() => "/education", "POST");
const useUpdateEducation = createMutationHook((vars) => `/education/${vars.id}`, "PUT");
const useDeleteEducation = createMutationHook((vars) => `/education/${vars.id}`, "DELETE");
const useListEnvironmental = createQueryHook("listEnvironmental", "/environmental", (vars = {}) => vars, { auth: false });
const useGetEnvironmental = createPathQueryHook("getEnvironmental", (vars = {}) => `/environmental/${vars.id}`, (vars = {}) => ({ id: vars.id }), { auth: false });
const useCreateEnvironmental = createMutationHook(() => "/environmental", "POST");
const useUpdateEnvironmental = createMutationHook((vars) => `/environmental/${vars.id}`, "PATCH");
const useDeleteEnvironmental = createMutationHook((vars) => `/environmental/${vars.id}`, "DELETE");
const useListGrievances = createQueryHook("listGrievances", "/grievances", (vars = {}) => vars, { auth: true });
const useGetGrievance = createPathQueryHook("getGrievance", (vars = {}) => `/grievances/${vars.id}`, (vars = {}) => ({ id: vars.id }), { auth: true });
const useCreateGrievance = createMutationHook(() => "/grievances", "POST", { auth: true });
const useUpdateGrievanceStatus = createMutationHook((vars) => `/grievances/${vars.id}`, "PUT", { auth: true });
export {
  getGetDashboardSummaryQueryKey,
  getGetEnvironmentalQueryKey,
  getGetGrievanceQueryKey,
  getGetGrievanceStatsQueryKey,
  getGetJobQueryKey,
  getGetRecentActivityQueryKey,
  getListAgricultureQueryKey,
  getListEducationQueryKey,
  getListEnvironmentalQueryKey,
  getListGrievancesQueryKey,
  getListHealthcareQueryKey,
  getListJobApplicantsQueryKey,
  getListMyJobApplicationsQueryKey,
  getListJobsQueryKey,
  setAuthTokenGetter,
  useApplyForJob,
  useAssignJob,
  useCreateAgriculture,
  useCreateEducation,
  useCreateEnvironmental,
  useCreateGrievance,
  useCreateHealthcare,
  useCreateJob,
  useDeleteAgriculture,
  useDeleteEducation,
  useDeleteEnvironmental,
  useDeleteHealthcare,
  useGetDashboardSummary,
  useGetEnvironmental,
  useGetGrievance,
  useGetGrievanceStats,
  useGetJob,
  useGetMe,
  useGetRecentActivity,
  useListAgriculture,
  useListEducation,
  useListEnvironmental,
  useListGrievances,
  useListHealthcare,
  useListJobApplicants,
  useListMyJobApplications,
  useListJobs,
  useLogin,
  useRegister,
  useUpdateAgriculture,
  useUpdateEducation,
  useUpdateEnvironmental,
  useUpdateGrievanceStatus,
  useUpdateHealthcare
};
