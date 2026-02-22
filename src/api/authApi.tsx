import api from "./api";

export const loginUser = (data: {
  email: string;
  password: string;
}) => api.post("/auth/login", data);

export const registerClient = (data: any) =>
  api.post("/auth/register/client", data);

export const registerCaregiver = (data: any) =>
  api.post("/auth/register/caregiver", data);


export const getAdminStats = () =>
  api.get("/admin/stats");

export const getPendingCaregivers = () =>
  api.get("/admin/caregivers/pending");

export const approveCaregiver = (id: string) =>
  api.put(`/admin/caregivers/approve/${id}`);

export const rejectCaregiver = (id: string) =>
  api.delete(`/admin/caregivers/reject/${id}`);

export const getCaregiverById = (id: string) =>
  api.get(`/admin/caregivers/${id}`);

export const getClientStats = () =>
  api.get("/client/stats");

export const getApprovedCaregivers = () =>
  api.get("/caregivers/approved");

export const getFamilyProfiles = () =>
  api.get("/family");

export const getFamilyProfileById = (id: string) =>
  api.get(`/family/${id}`);

export const updateFamilyProfile = (id: string, data: any) =>
  api.put(`/family/${id}`, data);

export const deleteFamilyProfile = (id: string) =>
  api.delete(`/family/${id}`);

export const getCaregiverDashboard = () =>
  api.get("/caregivers/dashboard");

export const getMyAvailability = () =>
  api.get("/availability");

export const addAvailabilityRange = (data: {
  day: string;
  startTime: string;
  endTime: string;
}) =>
  api.post("/availability", data);

export const removeAvailabilityRange = (data: {
  availabilityId: string;
  rangeIndex: number;
}) =>
  api.delete("/availability", { data });

export const getAvailableRanges = (caregiverId: string, date: string) =>
  api.get(`/availability/slots?caregiverId=${caregiverId}&date=${date}`);

export const createBooking = (data: {
  caregiverId: string;
  familyProfileId: string;
  date: string;
  startTime: string;
  endTime: string;
}) => api.post("/bookings", data);

export const acceptCaregiverBooking = (id: string) =>
  api.put(`/caregivers/bookings/${id}/accept`);

export const declineCaregiverBooking = (id: string) =>
  api.put(`/caregivers/bookings/${id}/decline`);

export const completeCaregiverBooking = (id: string) =>
  api.put(`/caregivers/bookings/${id}/complete`);

export const getMyNotifications = () =>
  api.get("/notifications");

export const getUnreadNotificationCount = () =>
  api.get("/notifications/unread-count");

export const markNotificationAsRead = (id: string) =>
  api.put(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = () =>
  api.put("/notifications/read-all");

export const getClientBookingHistory = (page = 1, limit = 3) =>
  api.get(`/client/bookings/history?page=${page}&limit=${limit}`);