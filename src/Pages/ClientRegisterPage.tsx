import { useState } from "react";
import { Input, Textarea } from "../Components/Form";

type ClientFormData = {
  fullName: string;
  occupation: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
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
    currentLocation: "",
    permanentAddress: "",
    profilePhoto: null
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Client Registration Data:", formData);

  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3">

        <div className="hidden md:flex flex-col justify-center bg-[#323e26] px-10 py-16 text-white">
          <h2 className="text-4xl font-semibold leading-snug mb-6">
            Join Our <br /> Family <br /> Network
          </h2>
          <p className="text-gray-200 leading-relaxed">
            Tell us a bit about yourself so we can provide the best care
            coordination for your loved ones.
          </p>
        </div>

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

          <div className="mb-10">
              <p className="text-xs font-semibold tracking-wide mb-3">
                PROFILE PHOTO
              </p>
              <input
                type="file"
                name="profilePhoto"
                onChange={handleFileChange}
                className="w-28 h-28 rounded-full border cursor-pointer"
              />
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Input
              label="FULL NAME"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />

            <Input
              label="OCCUPATION"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
            />

            <Input
              label="DATE OF BIRTH"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />

            <Input
              label="GENDER"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            />

            <Input
              label="PHONE NUMBER"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <Input
              label="EMAIL ADDRESS"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <Input
                label="CURRENT LOCATION"
                name="currentLocation"
                value={formData.currentLocation}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="PERMANENT ADDRESS"
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-12 w-full bg-[#323e26] text-white py-4 rounded-full font-medium text-lg hover:opacity-90 transition"
          >
            Create My Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientRegisterPage;
