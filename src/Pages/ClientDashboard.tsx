import { useEffect, useState } from "react";
import {
  getClientStats,
  getFamilyProfiles,
  deleteFamilyProfile,
  getClientBookingHistory,
  initiatePayment,
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
  paymentStatus: string;
  transactionCode: string | null;
  paidAt: string | null;
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
  const [payingId, setPayingId] = useState<string | null>(null);

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

  const handlePayNow = async (bookingId: string) => {
    try {
      setPayingId(bookingId);
      const res = await initiatePayment({ bookingId });
      const { payment_url } = res.data;

      // Khalti: simply redirect to payment_url
      // No form submission needed
      window.location.href = payment_url;
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
        "Payment initiation failed"
      );
      setPayingId(null);
    }
  };

  const getPaymentStyle = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-600";
      case "unpaid":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome, {fullName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Everything looks good today.
            </p>
          </div>
          <button
            onClick={() => navigate("/client/findcaregiver")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition"
            style={{ backgroundColor: "#2E4E3F" }}
          >
            Book New Care
          </button>
        </div>

        {/* ── STAT CARDS ── */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Active Sessions"
              value={stats.activeSessions}
            />
            <StatCard
              title="Upcoming"
              value={stats.upcomingSessions}
            />
            <StatCard
              title="To Pay"
              value={`Rs. ${stats.toPay}`}
            />
          </div>
        )}

        {/* ── BOOKING HISTORY ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Booking History
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Your recent care booking requests and
              session records.
            </p>
          </div>

          {bookingHistory.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No booking history available
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {bookingHistory.map((booking) => (
                  <div key={booking._id}
                       className="px-6 py-5 hover:bg-gray-50 transition">

                    {/* Top row: name + amount */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {booking.caregiverName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {booking.familyMemberName}
                        </p>
                      </div>
                      <p className="font-bold text-sm text-gray-900 shrink-0">
                        Rs. {booking.totalAmount}
                      </p>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                      <p className="text-xs text-gray-500">
                         {formatDate(booking.date)}
                      </p>
                      <p className="text-xs text-gray-500">
                         {booking.startTime} –{" "}
                        {booking.endTime}
                      </p>
                      {booking.paymentStatus === "paid" &&
                        booking.paidAt && (
                          <p className="text-xs text-green-600">
                            Paid on{" "}
                            {new Date(booking.paidAt)
                              .toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                          </p>
                        )}
                    </div>

                    {/* Badges + actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                        booking.status
                      )}`}>
                        {booking.status}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStyle(
                        booking.paymentStatus
                      )}`}>
                        {booking.paymentStatus === "paid"
                          ? "Paid"
                          : booking.paymentStatus === "failed"
                          ? "Payment Failed"
                          : "Unpaid"}
                      </span>

                      {booking.status === "confirmed" &&
                        booking.paymentStatus === "unpaid" && (
                          <button
                            onClick={() =>
                              handlePayNow(booking._id)
                            }
                            disabled={payingId === booking._id}
                            className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold disabled:opacity-60 transition"
                            style={{
                              backgroundColor: "#2E4E3F"
                            }}
                          >
                            {payingId === booking._id
                              ? "Redirecting..."
                              : "Pay Now"}
                          </button>
                        )}

                      {booking.status === "confirmed" &&
                        booking.paymentStatus === "failed" && (
                          <button
                            onClick={() =>
                              handlePayNow(booking._id)
                            }
                            disabled={payingId === booking._id}
                            className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold bg-red-500 disabled:opacity-60 transition"
                          >
                            {payingId === booking._id
                              ? "Redirecting..."
                              : "Retry Payment"}
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <button
                    onClick={() =>
                      setCurrentPage((p) => p - 1)
                    }
                    disabled={!pagination.hasPrevPage}
                    className={`px-4 py-2 rounded-xl text-sm border transition ${
                      pagination.hasPrevPage
                        ? "bg-white hover:bg-gray-50 text-gray-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-400">
                    Page {pagination.page} of{" "}
                    {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => p + 1)
                    }
                    disabled={!pagination.hasNextPage}
                    className={`px-4 py-2 rounded-xl text-sm border transition ${
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

        {/* ── FAMILY PROFILES ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Family Profiles
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage details for your loved ones who
                need care.
              </p>
            </div>
            <button
              onClick={() => navigate("/client/familyform")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition shrink-0"
              style={{ backgroundColor: "#2E4E3F" }}
            >
              + Add New Profile
            </button>
          </div>

          {familyProfiles.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No family profiles yet
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {familyProfiles.map((profile) => (
                <div key={profile._id} className="px-6 py-4">
                  <FamilyProfileCard
                    profile={profile}
                    onDelete={handleDelete}
                    onEdit={(profile) =>
                      navigate(
                        `/client/family/edit/${profile._id}`
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClientDashboard;
