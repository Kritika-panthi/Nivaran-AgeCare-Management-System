import { useEffect, useState } from "react";
import { Input, Textarea } from "../Components/Form";
import FileUpload from "../Components/FileUpload";
import Toast, { useToast } from "../Components/Toast";
import {
  getCaregiverProfile,
  updateCaregiverProfile,
} from "../api/caregiverApi";

const languageOptions = ["Nepali", "English", "Hindi"];

const skillOptions = [
  "Elderly Care",
  "Child Care",
  "Disability Support",
  "CPR Certified",
  "First Aid",
  "Medication Management",
  "Mobility Assistance",
  "Personal Care",
  "Light Housekeeping",
  "Educational Support",
];

type CaregiverProfileData = {
  fullName: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  experience: string;
  hourlyRate: string;
  bankAccount: string;
  languages: string[];
  skills: string[];
  currentAddress: string;
  permanentAddress: string;
  bio: string;
  profilePhoto: File | string | null;
  idProof: File | string | null;
  approvalStatus: string;
};

const CaregiverProfilePage = () => {
  const { toast, showToast, hideToast } = useToast();
  const [formData, setFormData] =
    useState<CaregiverProfileData>({
      fullName: "",
      age: "",
      gender: "",
      phone: "",
      email: "",
      experience: "",
      hourlyRate: "",
      bankAccount: "",
      languages: [],
      skills: [],
      currentAddress: "",
      permanentAddress: "",
      bio: "",
      profilePhoto: null,
      idProof: null,
      approvalStatus: "",
    });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getCaregiverProfile();
        setFormData(res.data);
      } catch (err) {
        console.error("Failed to fetch caregiver profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSelect = (
    field: "languages" | "skills",
    value: string
  ) => {
    setFormData((prev) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("age", formData.age);
    data.append("gender", formData.gender);
    data.append("phone", formData.phone);
    data.append("email", formData.email);
    data.append("experience", formData.experience);
    data.append("hourlyRate", formData.hourlyRate);
    data.append("bankAccount", formData.bankAccount);
    data.append("currentAddress", formData.currentAddress);
    data.append("permanentAddress", formData.permanentAddress);
    data.append("bio", formData.bio);

    formData.languages.forEach((lang) =>
      data.append("languages", lang)
    );
    formData.skills.forEach((skill) =>
      data.append("skills", skill)
    );

    if (formData.profilePhoto instanceof File) {
      data.append("profilePhoto", formData.profilePhoto);
    }
    if (formData.idProof instanceof File) {
      data.append("idProof", formData.idProof);
    }

    try {
      await updateCaregiverProfile(data);
      showToast(
          "Profile updated successfully",
          "success"
        );

      // Refresh profile
      const updated = await getCaregiverProfile();
      setFormData(updated.data);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Update failed",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-semibold text-[#323e26]">
            My Profile
          </h1>
          <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${
            formData.approvalStatus === "approved"
              ? "bg-green-100 text-green-700"
              : formData.approvalStatus === "rejected"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-700"
          }`}>
            {formData.approvalStatus}
          </span>
        </div>
        <p className="text-gray-500 mb-10">
          Manage your caregiver information
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-16 mb-12">
            <FileUpload
              label="PROFILE PHOTO"
              variant="circle"
              onFileSelect={(file) =>
                setFormData((prev) => ({
                  ...prev,
                  profilePhoto: file,
                }))
              }
              existingImage={
                typeof formData.profilePhoto === "string"
                  ? formData.profilePhoto
                  : null
              }
            />
            <FileUpload
              label="ID PROOF"
              variant="rectangle"
              onFileSelect={(file) =>
                setFormData((prev) => ({
                  ...prev,
                  idProof: file,
                }))
              }
              existingImage={
                typeof formData.idProof === "string"
                  ? formData.idProof
                  : null
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Input
              label="FULL NAME"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
            <Input
              label="AGE"
              name="age"
              type="text"
              inputMode="numeric"
              value={formData.age}
              onChange={handleChange}
            />
            <div>
              <label className="block text-xs font-semibold mb-2">
                GENDER
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4b5244]"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input
              label="PHONE NUMBER"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <Input
              label="EMAIL ADDRESS"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input
              label="EXPERIENCE (YEARS)"
              name="experience"
              type="text"
              inputMode="numeric"
              value={formData.experience}
              onChange={handleChange}
            />
            <Input
              label="HOURLY RATE (Rs.)"
              name="hourlyRate"
              type="text"
              inputMode="numeric"
              value={formData.hourlyRate}
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <Input
              label="BANK ACCOUNT NUMBER"
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleChange}
            />
          </div>

          <div className="my-6">
            <p className="text-xs font-semibold mb-2">
              LANGUAGES SPOKEN
            </p>
            <div className="flex gap-2 flex-wrap">
              {languageOptions.map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() =>
                    toggleSelect("languages", lang)
                  }
                  className={`px-3 py-1 rounded-full border transition ${
                    formData.languages.includes(lang)
                      ? "bg-[#4b5244] text-white border-[#4b5244]"
                      : "bg-gray-100"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="my-6">
            <p className="text-xs font-semibold mb-2">
              PROFESSIONAL SKILLS
            </p>
            <div className="flex gap-2 flex-wrap">
              {skillOptions.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() =>
                    toggleSelect("skills", skill)
                  }
                  className={`px-3 py-1 rounded-full border transition ${
                    formData.skills.includes(skill)
                      ? "bg-[#4b5244] text-white border-[#4b5244]"
                      : "bg-gray-100"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="my-6">
            <Input
              label="CURRENT ADDRESS"
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleChange}
            />
          </div>
          <div className="my-6">
            <Input
              label="PERMANENT ADDRESS"
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
            />
          </div>

          <Textarea
            label="BIO"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full bg-[#323e26] text-white py-4 rounded-full text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default CaregiverProfilePage;
