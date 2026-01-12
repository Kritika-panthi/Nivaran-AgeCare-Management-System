import api from "./api";

export const loginUser = (data: {
  email: string;
  password: string;
}) => api.post("/auth/login", data);

export const registerClient = (data: any) =>
  api.post("/auth/register/client", data);

export const registerCaregiver = (data: any) =>
  api.post("/auth/register/caregiver", data);

// Admin
export const getAdminStats = () =>
  api.get("/admin/stats");

export const getPendingCaregivers = () =>
  api.get("/admin/caregivers/pending");
