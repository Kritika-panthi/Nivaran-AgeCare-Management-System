import api from "./api";

export const getCaregiverProfile = () =>
  api.get("/caregivers/profile");

export const updateCaregiverProfile = (data: FormData) =>
  api.put("/caregivers/profile", data);
