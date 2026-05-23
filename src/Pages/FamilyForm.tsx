import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FileUpload from "../Components/FileUpload";
import { Input, Textarea } from "../Components/Form";
import api from "../api/api";
import MapPicker from "../Components/MapPicker";

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
  const { id } = useParams();
  const isEdit = Boolean(id);

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
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [location, setLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!isEdit) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get(`/family/${id}`);
        const p = res.data;

        setForm({
          photo: p.photo || null,
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

        if (p.parentLocation) {
          setLocation({
            address: p.livingAddress || "",
            lat: p.parentLocation.lat,
            lng: p.parentLocation.lng,
          });
        }
      } catch {
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
      currentMedicines: form.currentMedicines.filter(
        (_: any, i: number) => i !== index
      ),
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Validation
    const errors: string[] = [];

    if (!form.fullName.trim())
      errors.push("Full name is required");

    if (!form.age || isNaN(Number(form.age)) ||
        Number(form.age) < 1 || Number(form.age) > 120)
      errors.push("Age must be a valid number (1–120)");

    if (!form.gender)
      errors.push("Gender is required");

    if (form.phone && !/^\d{10}$/.test(
      form.phone.trim()
    ))
      errors.push(
        "Phone must be a valid 10-digit number"
      );

    if (form.emergencyContact && !/^\d{10}$/.test(
      form.emergencyContact.trim()
    ))
      errors.push(
        "Emergency contact must be a valid 10-digit number"
      );

    if (!form.mobilityLevel)
      errors.push("Please select a mobility level");

    if (!location)
      errors.push(
        "Please select the parent house location on the map"
      );

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    const selectedLocation = location;

    const data = new FormData();
    data.append("fullName", form.fullName);
    data.append("age", form.age);
    data.append("gender", form.gender);
    data.append("phone", form.phone);
    data.append("emergencyContact", form.emergencyContact);
    data.append("livingAddress", form.livingAddress);
    data.append(
      "parentLocation",
      JSON.stringify({
        lat: selectedLocation!.lat,
        lng: selectedLocation!.lng,
      })
    );
    data.append("bloodGroup", form.bloodGroup);
    data.append("allergies", form.allergies);
    data.append("mobilityLevel", form.mobilityLevel);
    data.append("chronicConditions", JSON.stringify(form.chronicConditions));
    data.append("currentMedicines", JSON.stringify(form.currentMedicines));
    data.append("notes", form.notes);

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
            <Input
              label="FULL NAME"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />
            <Input
              label="AGE"
              name="age"
              value={form.age}
              onChange={handleChange}
              inputMode="numeric"
            />
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
            <Input
              label="PHONE NUMBER"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              label="EMERGENCY CONTACT"
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Living Address
            </label>

            <input
              type="text"
              readOnly
              value={form.livingAddress}
              onClick={() => setIsMapOpen(true)}
              placeholder="Click to select parent house location on map"
              className="w-full border rounded-xl p-3 bg-white cursor-pointer"
            />

            <p className="text-xs text-gray-500 mt-2">
              Click the input to open map picker and choose the exact house location.
            </p>

            {location && (
              <p className="text-xs text-green-600 mt-2">
                ✔ Location selected
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold mb-2">
                BLOOD GROUP
              </label>
              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-100"
              >
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(
                  (bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  )
                )}
              </select>
            </div>

            <Input
              label="ALLERGIES"
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
            />
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
                    form.mobilityLevel === option
                      ? "bg-[#4b5a3f] text-white"
                      : "bg-gray-100"
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
                    form.chronicConditions.includes(condition)
                      ? "bg-[#4b5a3f] text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide mb-4">
              CURRENT MEDICINES
            </p>

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

          <Textarea
            label="NOTES FOR CAREGIVER"
            name="notes"
            value={form.notes}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full bg-[#4b5a3f] text-white py-5 rounded-3xl text-lg font-semibold"
          >
            {isEdit ? "Save Changes" : "Register Profile"}
          </button>
        </form>
      </div>

      <MapPicker
        isOpen={isMapOpen}
        initialPosition={
          location ? { lat: location.lat, lng: location.lng } : null
        }
        onClose={() => setIsMapOpen(false)}
        onConfirm={(selected) => {
          setLocation(selected);
          setForm((prev: any) => ({
            ...prev,
            livingAddress: selected.address,
          }));
        }}
      />
    </div>
  );
};

export default FamilyFormPage;
