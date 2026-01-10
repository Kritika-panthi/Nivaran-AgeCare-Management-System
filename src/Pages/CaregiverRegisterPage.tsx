import { useState } from "react";
import { Input, Textarea } from "../Components/Form";

type CaregiverFormData = {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Caregiver Registration Data:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3">

        <div className="hidden md:flex flex-col justify-center bg-[#323e26] px-10 py-16 text-white">
          <h2 className="text-4xl font-semibold leading-snug mb-6">
            Join Our <br /> Caregiver Network
          </h2>
          <p className="text-gray-200 leading-relaxed">
            Provide care for families, share your skills, and be part of a trusted caregiving platform.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="md:col-span-2 px-10 md:px-16 py-14"
        >
          <h1 className="text-3xl font-semibold mb-1">Caregiver Registration</h1>
          <p className="text-gray-500 mb-10">Care Provider Account</p>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold tracking-wide mb-2">PROFILE PHOTO</p>
              <input
                type="file"
                name="profilePhoto"
                onChange={handleFileChange}
                className="w-28 h-28 rounded-full border cursor-pointer"
              />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide mb-2">ID PROOF</p>
              <input
                type="file"
                name="idProof"
                onChange={handleFileChange}
                className="w-full h-12 rounded-lg border px-3 cursor-pointer"
              />
            </div>
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
              type="number"
              value={formData.age}
              onChange={handleChange}
            />
            <Input
              label="GENDER"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            />
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
              type="number"
              value={formData.experience}
              onChange={handleChange}
            />
            <Input
              label="HOURLY RATE (Rs.)"
              name="hourlyRate"
              type="number"
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

          <div className="mb-6">
            <p className="text-xs font-semibold tracking-wide mb-2">LANGUAGES SPOKEN</p>
            <div className="flex gap-2 flex-wrap">
              {languageOptions.map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => toggleSelect("languages", lang)}
                  className={`px-3 py-1 border rounded-full text-sm ${
                    formData.languages.includes(lang)
                      ? "bg-[#4b5244] text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold tracking-wide mb-2">PROFESSIONAL SKILLS</p>
            <div className="flex gap-2 flex-wrap">
              {skillOptions.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSelect("skills", skill)}
                  className={`px-3 py-1 border rounded-full text-sm ${
                    formData.skills.includes(skill)
                      ? "bg-[#4b5244] text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 gap-6">
          <Input
            label="CURRENT ADDRESS"
            name="currentAddress"
            value={formData.currentAddress}
            onChange={handleChange}
          />
          </div>

          <div className="mb-6">
          <Input
            label="PERMANENT ADDRESS"
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
          />
          </div>
          
          <Textarea
            label="TELL US ABOUT YOURSELF (BIO)"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="mt-6 w-full bg-[#323e26] text-white py-4 rounded-full font-medium text-lg hover:opacity-90 transition"
          >
            Submit for Approval
          </button>
        </form>
      </div>
    </div>
  );
};

export default CaregiverRegisterPage;
