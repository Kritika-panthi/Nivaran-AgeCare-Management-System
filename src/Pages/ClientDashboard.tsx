import { useEffect, useState } from "react";
import {
  getClientStats,
  getFamilyProfiles,
  deleteFamilyProfile,
  getClientBookingHistory,
} from "../api/authApi";
import StatCard from "../Components/StatCard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FamilyProfileCard from "../Components/FamilyProfileCard";

type ClientStats = {
  activeSessions: number;
  upcomingSessions: number;
  toPay: number;
};

type BookingHistoryItem = {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  hours: number;
  caregiverName: string;
  familyMemberName: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "confirmed":
      return "bg-blue-100 text-blue-700";
    case "completed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const ClientDashboard = () => {
  const [familyProfiles, setFamilyProfiles] = useState<any[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const { fullName } = useAuth();

  const fetchFamilyProfiles = async () => {
    const res = await getFamilyProfiles();
    setFamilyProfiles(res.data);
  };

  const fetchStats = async () => {
    try {
      const res = await getClientStats();
      setStats(res.data);
    } catch {
      console.error("Failed to fetch client stats");
    }
  };

  const fetchBookingHistory = async (page = 1) => {
    try {
      const res = await getClientBookingHistory(page, 3);
      setBookingHistory(res.data.bookings);
      setPagination(res.data.pagination);
    } catch {
      console.error("Failed to fetch booking history");
    }
  };

  useEffect(() => {
    fetchStats();
    fetchFamilyProfiles();
  }, []);

  useEffect(() => {
    fetchBookingHistory(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    await deleteFamilyProfile(id);
    fetchFamilyProfiles();
  };

  return (
    <div className="min-h-screen bg-gray-100 px-25 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome, {fullName}
          </h1>
          <p className="text-gray-500">
            Everything looks good today.
          </p>
        </div>

        <button
          onClick={() => navigate("/client/findcaregiver")}
          className="bg-[#2E4E3F] text-white px-8 py-3 rounded-xl shadow hover:opacity-90 transition"
        >
          Book New Care →
        </button>
      </div>

      {stats && (
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <StatCard title="Active Sessions" value={stats.activeSessions} />
          <StatCard title="Upcoming" value={stats.upcomingSessions} />
          <StatCard title="To Pay" value={`Rs. ${stats.toPay}`} />
        </div>
      )}

      {/* Booking History Section */}
      <div className="bg-white rounded-3xl p-10 shadow-sm mb-16">
        <div className="mb-8">
          <h2 className="text-xl font-semibold">
            Booking History
          </h2>
          <p className="text-gray-500 text-sm">
            View your recent care booking requests and session records.
          </p>
        </div>

        {bookingHistory.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No booking history available
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {bookingHistory.map((booking) => (
                <div
                  key={booking._id}
                  className="border rounded-2xl p-5 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-lg">
                      {booking.caregiverName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Family Member: {booking.familyMemberName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {formatDate(booking.date)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Time: {booking.startTime} - {booking.endTime}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold mb-2">
                      Rs. {booking.totalAmount}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`px-5 py-2 rounded-xl border ${
                    pagination.hasPrevPage
                      ? "bg-white hover:bg-gray-50 text-gray-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Previous
                </button>

                <span className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`px-5 py-2 rounded-xl border ${
                    pagination.hasNextPage
                      ? "bg-white hover:bg-gray-50 text-gray-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Family Profiles Section */}
      <div className="bg-white rounded-3xl p-10 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold">
              Family Profiles
            </h2>
            <p className="text-gray-500 text-sm">
              Manage details for your loved ones who need care.
            </p>
          </div>

          <button
            onClick={() => navigate("/client/familyform")}
            className="bg-[#2E4E3F] text-white px-6 py-3 rounded-xl shadow"
          >
            + Add New Profile
          </button>
        </div>

        <div className="space-y-6">
          {familyProfiles.length === 0 ? (
            <p className="text-gray-400 text-center py-10">
              No family profiles yet
            </p>
          ) : (
            familyProfiles.map((profile) => (
              <FamilyProfileCard
                key={profile._id}
                profile={profile}
                onDelete={handleDelete}
                onEdit={(profile) =>
                  navigate(`/client/family/edit/${profile._id}`)
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;