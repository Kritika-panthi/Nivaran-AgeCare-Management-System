import { useEffect, useState } from "react";
import ClientForm from "../Components/ClientForm";
import api from "../api/api";
import Toast, { useToast } from "../Components/Toast";

// State for storing client profile data
const ClientProfilePage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    occupation: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    currentLocation: "",
    permanentAddress: "",
    profilePhoto: null as File | string | null,
  });

  const { toast, showToast, hideToast } = useToast();

  // Fetch client profile from backend 
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/client/profile");
        setFormData(res.data);
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, []);

   // Handle input changes (text, number, textarea)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const data = new FormData();

  data.append("fullName", formData.fullName);
  data.append("occupation", formData.occupation);
  data.append("dob", formData.dob);
  data.append("gender", formData.gender);
  data.append("phone", formData.phone);
  data.append("email", formData.email);
  data.append("currentLocation", formData.currentLocation);
  data.append("permanentAddress", formData.permanentAddress);

  // Only append if it is actually a File
  if (formData.profilePhoto instanceof File) {
    data.append("profilePhoto", formData.profilePhoto);
  }

  try {
    await api.put("/client/profile", data);

    showToast(
      "Profile updated successfully",
      "success"
    );

    // refresh profile from backend
    const updated = await api.get("/client/profile");
    setFormData(updated.data);

  } catch (err) {
   showToast("Update failed", "error");
  }
};

  return (
    <>
  {toast && (
      <div
        className="fixed top-5 left-1/2
                   -translate-x-1/2
                   z-99999
                   w-full max-w-md px-4"
      >
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      </div>
    )}
    <div className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-12">
        <h1 className="text-3xl font-semibold mb-2 text-[#323e26]">
          My Profile
        </h1>
        <p className="text-gray-500 mb-10">
          Manage your personal information
        </p>

        <form onSubmit={handleSubmit}>
          <ClientForm
            formData={formData}
            onChange={handleChange}
            onGenderChange={(value) =>
              setFormData((prev) => ({ ...prev, gender: value }))
            }
            onFileSelect={(file) =>
              setFormData((prev) => ({ ...prev, profilePhoto: file }))
            }
          />

          <button
            type="submit"
            className="mt-12 w-full bg-[#323e26] text-white py-4 rounded-full text-lg hover:opacity-90 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default ClientProfilePage;