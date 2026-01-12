import { useState } from "react";
import api from "../api/api";
import ClientForm from "../Components/ClientForm";

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

      alert("Client registered successfully");
    } catch (error: any) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3">

        {/* Left Branding Section */}
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
          className="md:col-span-2 px-10 md:px-16 py-14"
        >
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
  );
};

export default ClientRegisterPage;