import api from "./api";

export const loginUser = (data: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) => api.post("/auth/login", data);

export const registerClient = (data: any) =>
  api.post("/auth/register/client", data);

export const registerCaregiver = (data: any) =>
  api.post("/auth/register/caregiver", data);

// admin
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

// Family form
export const getFamilyProfiles = () =>
  api.get("/family");

export const getFamilyProfileById = (id: string) =>
  api.get(`/family/${id}`);

export const updateFamilyProfile = (id: string, data: any) =>
  api.put(`/family/${id}`, data);

export const deleteFamilyProfile = (id: string) =>
  api.delete(`/family/${id}`);

// Caregiver Dashboard
export const getCaregiverDashboard = () =>
  api.get("/caregivers/dashboard");

// Availability
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

// booking
export const createBooking = (data: {
  caregiverId: string;
  familyProfileId: string;
  date: string;
  startTime: string;
  endTime: string;
  parentLocation: {
    lat: number;
    lng: number;
  };
}) => api.post("/bookings", data);

export const createMultiDayBooking = (data: {
  caregiverId: string;
  familyProfileId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}) => api.post("/bookings/multi-day", data);

export const acceptCaregiverBooking = (id: string) =>
  api.put(`/caregivers/bookings/${id}/accept`);

export const declineCaregiverBooking = (id: string) =>
  api.put(`/caregivers/bookings/${id}/decline`);

export const completeCaregiverBooking = (id: string) =>
  api.put(`/caregivers/bookings/${id}/complete`);

// Notifications
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

export const getBookingTrackingById = (id: string) =>
  api.get(`/bookings/${id}/tracking`);

// Google login
export const googleLoginApi = (data: {
  credential: string;
}) => api.post("/auth/google", data);

// Forgot / Reset password
export const forgotPassword = (data: {
  email: string;
}) => api.post("/auth/forgot-password", data);

export const resetPassword = (data: {
  token: string;
  email: string;
  password: string;
}) => api.post("/auth/reset-password", data);

// Complete Google profile
export const completeGoogleProfile = (data: {
  phone: string;
  occupation: string;
  dob: string;
  gender: string;
  currentLocation: string;
  permanentAddress: string;
}) => api.post("/client/complete-profile", data);

export const sendContactMessage = (data: {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}) => api.post("/auth/contact", data);

// Payment
export const initiatePayment = (data: {
  bookingId: string;
}) => api.post("/payment/initiate", data);

export const verifyPayment = (pidx: string) =>
  api.get(`/payment/verify?pidx=${pidx}`);

// Admin
export const getAllUsers = () =>
  api.get("/admin/users");

export const getAllCaregivers = () =>
  api.get("/admin/caregivers");

export const getAllBookings = () =>
  api.get("/admin/bookings");

export const toggleUserActive = (id: string) =>
  api.patch(`/admin/users/${id}/toggle`);
