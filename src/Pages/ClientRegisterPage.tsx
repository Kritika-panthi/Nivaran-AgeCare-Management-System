import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/api";
import ClientForm from "../Components/ClientForm";
import Toast, { useToast } from "../Components/Toast";

type ClientFormData = {
  fullName: string;
  occupation: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  password: string;
  currentLocation: string;
  permanentAddress: string;
  profilePhoto: File | null;
};

const ClientRegisterPage = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState<ClientFormData>({
    fullName: "",
    occupation: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
    currentLocation: "",
    permanentAddress: "",
    profilePhoto: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: string[] = [];

    if (!formData.fullName.trim())
      errors.push("Full name is required");

    if (!formData.occupation.trim())
      errors.push("Occupation is required");

    if (!formData.dob)
      errors.push("Date of birth is required");
    else {
      const dob = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18)
        errors.push("You must be at least 18 years old");
    }

    if (!formData.gender)
      errors.push("Gender is required");

    if (!formData.phone.trim() ||
        !/^\d{10}$/.test(formData.phone.trim()))
      errors.push("Phone must be a valid 10-digit number");

    if (!formData.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          formData.email.trim()
        ))
      errors.push("Valid email address is required");

    if (!formData.password ||
        formData.password.length < 6)
      errors.push("Password must be at least 6 characters");

    if (!formData.currentLocation.trim())
      errors.push("Current location is required");

    if (!formData.permanentAddress.trim())
      errors.push("Permanent address is required");

    if (errors.length > 0) {
      showToast(errors[0], "error");
      return;
    }

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        data.append(key, value as any);
      }
    });

    try {
      await api.post("/auth/register/client", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showToast(
        "Account created successfully! You can now sign in.",
        "success"
      );
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
        "Registration failed",
        "error"
      );
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
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3">

        {/* Left side Section */}
        <div className="hidden md:flex flex-col justify-center bg-[#323e26] px-10 py-16 text-white">
          <h2 className="text-4xl font-semibold mb-6">
            Join Our <br /> Family Network
          </h2>
          <p className="text-gray-200">
            Help us coordinate the best care for your loved ones.
          </p>
        </div>

        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="md:col-span-2 px-10 md:px-16 py-10"
        >
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </button>
          <h1 className="text-3xl font-semibold mb-1">
            Client Registration
          </h1>
          <p className="text-gray-500 mb-10">
            Family Member Account
          </p>

          <ClientForm
            formData={formData}
            onChange={handleChange}
            onGenderChange={(value) =>
              setFormData((prev) => ({ ...prev, gender: value }))
            }
            onFileSelect={(file) =>
              setFormData((prev) => ({ ...prev, profilePhoto: file }))
            }
            showPassword
          />

          <button
            type="submit"
            className="mt-12 w-full bg-[#323e26] text-white py-4 rounded-full text-lg hover:opacity-90 transition"
          >
            Create My Account
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default ClientRegisterPage;
