import { useState, useEffect } from "react";
import { useNavigate, useParams} from "react-router-dom";
import FileUpload from "../Components/FileUpload";
import { Input, Textarea } from "../Components/Form";
import api from "../api/api";

// Options for mobility level and chronic conditions
const mobilityOptions = [
  "WALKS ALONE",
  "USES STICK",
  "WHEELCHAIR",
  "BEDRIDDEN",
  "NONE",
];

const chronicOptions = [
  "DIABETES",
  "BP",
  "ARTHRITIS",
  "HEART",
  "THYROID",
  "ASTHMA",
];

const FamilyFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // if id exists, we are editing
  const isEdit = Boolean(id);

  // Form state
  const [form, setForm] = useState<any>({
    photo: null,
    fullName: "",
    age: "",
    gender: "Male",
    phone: "",
    emergencyContact: "",
    livingAddress: "",
    bloodGroup: "O+",
    allergies: "",
    mobilityLevel: "",
    chronicConditions: [],
    currentMedicines: [],
    notes: "",
  });

  const [medicineInput, setMedicineInput] = useState("");
  // Fetch profile data if editing
  useEffect(() => {
    if (!isEdit) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get(`/family/${id}`);
        const p = res.data;

         // Set form state with fetched profile data
        setForm({
          photo: p.photo || null, // string filename from backend
          fullName: p.fullName || "",
          age: p.age?.toString() || "",
          gender: p.gender || "Male",
          phone: p.phone || "",
          emergencyContact: p.emergencyContact || "",
          livingAddress: p.livingAddress || "",
          bloodGroup: p.bloodGroup || "O+",
          allergies: p.allergies || "",
          mobilityLevel: p.mobilityLevel || "NONE",
          chronicConditions: p.chronicConditions || [],
          currentMedicines: p.currentMedicines || [],
          notes: p.notes || "",
        });
      } catch (err) {
        alert("Failed to load family profile");
        navigate("/client");
      }
    };

    fetchProfile();
  }, [id, isEdit, navigate]);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleChronic = (condition: string) => {
    setForm((prev: any) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter((c: string) => c !== condition)
        : [...prev.chronicConditions, condition],
    }));
  };

  const addMedicine = () => {
  if (!medicineInput.trim()) return;

  setForm({
    ...form,
    currentMedicines: [...form.currentMedicines, medicineInput.trim()],
  });
  setMedicineInput("");
};

const removeMedicine = (index: number) => {
    setForm({
      ...form,
      currentMedicines: form.currentMedicines.filter((_: any, i: number) => i !== index),
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

     // Basic frontend guard (prevents backend 500)
    if (!form.fullName || !form.age || !form.gender) {
      return alert("Full name, age and gender are required");
    }

    const data = new FormData();

    data.append("fullName", form.fullName);
    data.append("age", form.age);
    data.append("gender", form.gender);
    data.append("phone", form.phone);
    data.append("emergencyContact", form.emergencyContact);
    data.append("livingAddress", form.livingAddress);
    data.append("bloodGroup", form.bloodGroup);
    data.append("allergies", form.allergies);
    data.append("mobilityLevel", form.mobilityLevel);
    data.append("chronicConditions", JSON.stringify(form.chronicConditions));
    data.append("currentMedicines", JSON.stringify(form.currentMedicines));
    data.append("notes", form.notes);

    // Only send photo if it is a NEW File
    if (form.photo instanceof File) {
      data.append("photo", form.photo);
    }

    try {
      if (isEdit) {
        await api.put(`/family/${id}`, data);
      } else {
        await api.post("/family", data);
      }

      navigate("/client");
    } catch (err: any) {
      alert(err.response?.data?.message || "Save failed");
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-16">
      <div className="bg-white w-[900px] rounded-3xl shadow-xl p-12">
        <h1 className="text-3xl font-bold mb-1">
          {isEdit ? "Edit Family Details" : "Family Details"}
        </h1>
        <p className="text-gray-500 mb-10">Medical & Social Registry</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <FileUpload
            label="PHOTO"
            variant="circle"
            onFileSelect={(file) => setForm({ ...form, photo: file })}
            existingImage={typeof form.photo === "string" ? form.photo : null}
          />

          <div className="grid grid-cols-2 gap-6">
            <Input label="FULL NAME" name="fullName" value={form.fullName} onChange={handleChange} />
            <Input label="AGE" name="age" value={form.age} onChange={handleChange} inputMode="numeric" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2">GENDER</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-100"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input label="PHONE NUMBER" name="phone" value={form.phone} onChange={handleChange} />
            <Input label="EMERGENCY CONTACT" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
          </div>

          <Input label="LIVING ADDRESS" name="livingAddress" value={form.livingAddress} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold mb-2">BLOOD GROUP</label>
              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-100"
              >
                {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <Input label="ALLERGIES" name="allergies" value={form.allergies} onChange={handleChange} />
          </div>

          <div>
            <p className="text-xs font-semibold mb-3">MOBILITY LEVEL</p>
            <div className="flex flex-wrap gap-3">
              {mobilityOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setForm({ ...form, mobilityLevel: option })}
                  className={`px-4 py-3 rounded-xl font-semibold border ${
                    form.mobilityLevel === option ? "bg-[#4b5a3f] text-white" : "bg-gray-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-3">CHRONIC CONDITIONS</p>
            <div className="flex flex-wrap gap-3">
              {chronicOptions.map((condition) => (
                <button
                  type="button"
                  key={condition}
                  onClick={() => toggleChronic(condition)}
                  className={`px-4 py-2 rounded-full font-semibold border ${
                    form.chronicConditions.includes(condition) ? "bg-[#4b5a3f] text-white" : "bg-gray-100"
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide mb-4">CURRENT MEDICINES</p>

            <div className="flex gap-4 mb-6">
              <input
                value={medicineInput}
                onChange={(e) => setMedicineInput(e.target.value)}
                placeholder="Add medicine name"
                className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-md focus:outline-none focus:ring-2 focus:ring-[#4b5a3f]"
              />

              <button
                type="button"
                onClick={addMedicine}
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#4b5a3f] text-white text-4xl font-light hover:opacity-90 transition"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              {form.currentMedicines.map((med: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-100 px-4 py-3 rounded-2xl text-lg"
                >
                  <span>{med}</span>

                  <button
                    type="button"
                    onClick={() => removeMedicine(index)}
                    className="text-gray-400 hover:text-[#2E4E3F] text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Textarea label="NOTES FOR CAREGIVER" name="notes" value={form.notes} onChange={handleChange} />

          <button
            type="submit"
            className="w-full bg-[#4b5a3f] text-white py-5 rounded-3xl text-lg font-semibold"
          >
            {isEdit ? "Save Changes" : "Register Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FamilyFormPage;