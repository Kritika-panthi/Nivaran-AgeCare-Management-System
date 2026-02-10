import { useEffect, useState } from "react";
import {
  getPendingCaregivers,
  approveCaregiver,
  rejectCaregiver,
  getAdminStats,
  getCaregiverById,
} from "../api/authApi";
import StatCard from "../Components/StatCard";

type CaregiverType = {
  _id: string;
  user: {
    fullName: string;
    email: string;
  };
  phone: string;
  experience: number;
};

type StatsType = {
  totalUsers: number;
  verifiedCaregivers: number;
  pendingApprovals: number;
  activeSessions: number;
};

const AdminDashboard = () => {
  const [pendingCaregivers, setPendingCaregivers] = useState<CaregiverType[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [caregiverRes, statsRes] = await Promise.all([
        getPendingCaregivers(),
        getAdminStats(),
      ]);
      console.log("Stats:", statsRes.data);
      console.log("Pending:", caregiverRes.data);

      setPendingCaregivers(caregiverRes.data);
      setStats(statsRes.data);
    } catch {
      console.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    await approveCaregiver(id);
    setSelectedCaregiver(null);
    fetchData();
  };

  const handleReject = async (id: string) => {
    await rejectCaregiver(id);
    setSelectedCaregiver(null);
    fetchData();
  };

  const openDetails = async (id: string) => {
    const res = await getCaregiverById(id);
    setSelectedCaregiver(res.data);
  };

  if (loading)
    return <div className="p-10 text-lg">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 px-20 py-8">
      <h1 className="text-4xl font-bold mb-12">
        Welcome, Admin
      </h1>

      {/* STAT CARDS */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <StatCard title="Total Users" value={stats.totalUsers} />
          <StatCard title="Verified Caregivers" value={stats.verifiedCaregivers} />
          <StatCard title="Active Sessions" value={stats.activeSessions} />
          <StatCard title="Pending Approvals" value={stats.pendingApprovals} />
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-6">
        Pending Caregiver Approvals
      </h2>

      {pendingCaregivers.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-500 shadow-sm">
          No pending approvals
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Experience</th>
                <th className="text-left px-6 py-4">Phone</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pendingCaregivers.map((caregiver) => (
                <tr
                  key={caregiver._id}
                  className="border-t text-sm hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium">
                    {caregiver.user.fullName}
                  </td>
                  <td className="px-6 py-4">
                    {caregiver.experience} Years
                  </td>
                  <td className="px-6 py-4">
                    {caregiver.phone}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => openDetails(caregiver._id)}
                      className="px-4 py-1 bg-blue-600 text-white rounded-full text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCaregiver && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl p-8 shadow-lg">

            <h2 className="text-2xl font-semibold mb-6">
              Caregiver Details
            </h2>

            <div className="space-y-3 text-sm">

              <p><strong>Name:</strong> {selectedCaregiver.user.fullName}</p>
              <p><strong>Email:</strong> {selectedCaregiver.user.email}</p>
              <p><strong>Phone:</strong> {selectedCaregiver.phone}</p>
              <p><strong>Age:</strong> {selectedCaregiver.age}</p>
              <p><strong>Gender:</strong> {selectedCaregiver.gender}</p>
              <p><strong>Experience:</strong> {selectedCaregiver.experience} Years</p>
              <p><strong>Hourly Rate:</strong> Rs. {selectedCaregiver.hourlyRate}</p>
              <p><strong>Languages:</strong> {selectedCaregiver.languages.join(", ")}</p>
              <p><strong>Skills:</strong> {selectedCaregiver.skills.join(", ")}</p>
              <p><strong>Bio:</strong> {selectedCaregiver.bio}</p>

              <div className="mt-4">
                <p className="font-semibold mb-2">Profile Photo:</p>
                <img
                  src={`http://localhost:3000/uploads/${selectedCaregiver.profilePhoto}`}
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>

              <div className="mt-4">
                <p className="font-semibold mb-2">ID Proof:</p>
                <a
                  href={`http://localhost:3000/uploads/${selectedCaregiver.idProof}`}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View Document
                </a>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setSelectedCaregiver(null)}
                className="px-6 py-2 border rounded-full"
              >
                Close
              </button>

              <button
                onClick={() => handleApprove(selectedCaregiver._id)}
                className="px-6 py-2 bg-green-600 text-white rounded-full"
              >
                Approve
              </button>

              <button
                onClick={() => handleReject(selectedCaregiver._id)}
                className="px-6 py-2 bg-red-600 text-white rounded-full"
              >
                Reject
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
