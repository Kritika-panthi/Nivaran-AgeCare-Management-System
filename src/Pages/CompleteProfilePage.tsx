import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeGoogleProfile } from "../api/authApi";

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    occupation: "",
    dob: "",
    gender: "",
    currentLocation: "",
    permanentAddress: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await completeGoogleProfile(formData);
      navigate("/client");
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
        "Failed to save profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          Complete Your Profile
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Just a few more details to get you started
          on Nivaran.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            {
              name: "phone",
              label: "Phone",
              type: "tel"
            },
            {
              name: "occupation",
              label: "Occupation",
              type: "text"
            },
            {
              name: "dob",
              label: "Date of Birth",
              type: "date"
            },
            {
              name: "currentLocation",
              label: "Current Location",
              type: "text"
            },
            {
              name: "permanentAddress",
              label: "Permanent Address",
              type: "text"
            },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                {field.label}
              </label>
              <input
                name={field.name}
                type={field.type}
                value={
                  formData[
                    field.name as keyof typeof formData
                  ]
                }
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#323e26]"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#323e26]"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm mt-2 disabled:opacity-50 transition"
            style={{ backgroundColor: "#323e26" }}
          >
            {loading
              ? "Saving..."
              : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
