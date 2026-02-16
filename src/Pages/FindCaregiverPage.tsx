import { useEffect, useState } from "react";
import { getApprovedCaregivers } from "../api/authApi";
import { MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Caregiver = {
  _id: string;
  user: {
    fullName: string;
  } | null;
  profilePhoto: string;
  experience: number;
  hourlyRate: number;
  currentAddress: string;
  bio?: string;
  skills?: string[];
};

const FindCaregiverPage = () => {
  const navigate = useNavigate();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        const res = await getApprovedCaregivers();
        setCaregivers(res.data);
      } catch (error) {
        console.error("Failed to fetch caregivers");
      }
    };

    fetchCaregivers();
  }, []);

  const filtered = caregivers.filter((c) => {
    if (!search) return true;
    const query = search.toLowerCase();

    const nameMatch = c.user?.fullName
        ?.toLowerCase()
        .includes(query);

    const skillsMatch = c.skills?.some((skill) =>
        skill.toLowerCase().includes(query)
    );

    return nameMatch || skillsMatch;
    });

  return (
    <div className="min-h-screen bg-gray-100 px-10 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Search */}
        <div className="flex justify-center mb-14">
          <input
            type="text"
            placeholder="Search by name or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/2 px-6 py-4 rounded-2xl bg-white shadow focus:outline-none"
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {filtered.map((caregiver) => (
            <div
              key={caregiver._id}
              className="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition duration-300"
            >
              {/* Profile Image */}
                <img
                    src={`http://localhost:3000/uploads/${caregiver.profilePhoto}`}
                    alt="profile"
                    className="w-20 h-20 rounded-xl object-cover mb-4"
                />

              {/* Name */}
              <h3 className="text-xl font-semibold mb-2">
                <h3 className="text-2xl font-bold mb-2">
                    {caregiver.user?.fullName || "Unknown"}
                </h3>
              </h3>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-1">
                <MapPin size={14} />
                {caregiver.currentAddress}
              </div>

              {/* Experience */}
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-5">
                <Briefcase size={14} />
                {caregiver.experience} Years Experience
              </div>

              {/* Bio */}
              <p className="text-gray-600 font-semibold leading-relaxed mb-8 line-clamp-3">
                {caregiver.bio}
              </p>

              {/* Skills */}
              {caregiver.skills && caregiver.skills.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-10">
                  {caregiver.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs font-bold tracking-wide px-4 py-2 rounded-full bg-gray-100 border text-gray-600"
                    >
                      {skill.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}

                {/* Divider */}
              <hr className="border-gray-200 mb-8" />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold">
                    Rs. {caregiver.hourlyRate}
                  </p>
                  <p className="text-xs font-semibold text-gray-400 tracking-wide">
                    PER HOUR
                  </p>
                </div>

               <button
                  onClick={() => navigate(`/client/book/${caregiver._id}`)}
                  className="px-8 py-3 rounded-2xl border-2 border-[#2E4E3F] text-[#2E4E3F] font-bold transition duration-300 hover:bg-[#2E4E3F] hover:text-white"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FindCaregiverPage;