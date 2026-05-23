import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input, Textarea } from "../Components/Form";
import api from "../api/api";
import FileUpload from "../Components/FileUpload";
import Toast, { useToast } from "../Components/Toast";


type CaregiverFormData = {
  fullName: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  password: string;
  experience: string;
  hourlyRate: string;
  bankAccount: string;
  languages: string[];
  skills: string[];
  currentAddress: string;
  permanentAddress: string;
  bio: string;
  profilePhoto: File | null;
  idProof: File | null;
};

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

const CaregiverRegisterPage = () => {
  const [formData, setFormData] = useState<CaregiverFormData>({
    fullName: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
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
  });
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSelect = (field: "languages" | "skills", value: string) => {
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

    // Validation
    const errors: string[] = [];

    if (!formData.fullName.trim())
      errors.push("Full name is required");

    if (!formData.age || isNaN(Number(formData.age)) ||
        Number(formData.age) < 18 ||
        Number(formData.age) > 70)
      errors.push("Age must be between 18 and 70");

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

    if (!formData.experience.trim() ||
        isNaN(Number(formData.experience)) ||
        Number(formData.experience) < 0)
      errors.push("Valid experience in years is required");

    if (!formData.hourlyRate.trim() ||
        isNaN(Number(formData.hourlyRate)) ||
        Number(formData.hourlyRate) <= 0)
      errors.push("Valid hourly rate is required");

    if (!formData.bankAccount.trim())
      errors.push("Bank account number is required");

    if (formData.languages.length === 0)
      errors.push("Select at least one language");

    if (formData.skills.length === 0)
      errors.push("Select at least one skill");

    if (!formData.currentAddress.trim())
      errors.push("Current address is required");

    if (!formData.permanentAddress.trim())
      errors.push("Permanent address is required");

    if (!formData.bio.trim())
      errors.push("Bio is required");

    if (!formData.profilePhoto)
      errors.push("Profile photo is required");

    if (!formData.idProof)
      errors.push("ID proof is required");

    if (errors.length > 0) {
      showToast(errors[0], "error");
      return;
    }

    const data = new FormData();

    data.append("fullName", formData.fullName);
    data.append("age", formData.age);
    data.append("gender", formData.gender);
    data.append("phone", formData.phone);
    data.append("email", formData.email);
    data.append("password", formData.password);
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

    if (formData.profilePhoto) {
      data.append("profilePhoto", formData.profilePhoto);
    }

    if (formData.idProof) {
      data.append("idProof", formData.idProof);
    }

    try {
      await api.post("/auth/register/caregiver", data);

      showToast(
        "Registration submitted! Waiting for admin approval.",
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
                   z-[99999]
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

        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center bg-[#323e26] px-10 py-16 text-white">
          <h2 className="text-4xl font-semibold mb-6">
            Join Our <br /> Caregiver Network
          </h2>
          <p className="text-gray-200">
            Provide care for families and be part of a trusted caregiving platform.
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
            Caregiver Registration
          </h1>
          <p className="text-gray-500 mb-10">
            Care Provider Account
          </p>

       {/* Profile photo Section */}
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
          />
       </div>
 
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Input label="FULL NAME" name="fullName" value={formData.fullName} onChange={handleChange} />
            <Input label="AGE" name="age" type="text" inputMode="numeric" value={formData.age} onChange={handleChange} />

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

          {/* Contact section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="PHONE NUMBER" name="phone" value={formData.phone} onChange={handleChange} />
            <Input label="EMAIL ADDRESS" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>

          <div className="mb-6">
            <Input label="PASSWORD" name="password" type="password" value={formData.password} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="EXPERIENCE (YEARS)" name="experience" type="text" inputMode="numeric" value={formData.experience} onChange={handleChange} />
            <Input label="HOURLY RATE (Rs.)" name="hourlyRate" type="text" inputMode="numeric" value={formData.hourlyRate} onChange={handleChange} />
          </div>

          <Input label="BANK ACCOUNT NUMBER" name="bankAccount" value={formData.bankAccount} onChange={handleChange} />

          {/* Languages section*/}
          <div className="my-6">
            <p className="text-xs font-semibold mb-2">LANGUAGES SPOKEN</p>
            <div className="flex gap-2 flex-wrap">
              {languageOptions.map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => toggleSelect("languages", lang)}
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

          {/* Skills section*/}
          <div className="my-6">
            <p className="text-xs font-semibold mb-2">PROFESSIONAL SKILLS</p>
            <div className="flex gap-2 flex-wrap">
              {skillOptions.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSelect("skills", skill)}
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
            <Input label="CURRENT ADDRESS" 
              name="currentAddress" value={formData.currentAddress} 
              onChange={handleChange} />
          </div>
              
          <div className="my-6">
            <Input label="PERMANENT ADDRESS" 
            name="permanentAddress" value={formData.permanentAddress} 
            onChange={handleChange} />
          </div>
          
          <Textarea label="BIO" name="bio" value={formData.bio} onChange={handleChange} />
          
          <button
            type="submit"
            className="mt-8 w-full bg-[#323e26] text-white py-4 rounded-full text-lg hover:opacity-90 transition"
          >
            Submit for Approval
          </button>

        </form>
      </div>
    </div>
    </>
  );
};

export default CaregiverRegisterPage;
