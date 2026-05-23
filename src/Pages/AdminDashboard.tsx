import { useEffect, useState } from "react";
import {
  getPendingCaregivers,
  approveCaregiver,
  rejectCaregiver,
  getAdminStats,
  getCaregiverById,
  getAllUsers,
  getAllCaregivers,
  getAllBookings,
  toggleUserActive,
} from "../api/authApi";
import StatCard from "../Components/StatCard";
import AdminSidebar from "../Components/AdminSidebar";
import { Search, X, CheckCircle, XCircle } from "lucide-react";

type StatsType = {
  totalUsers: number;
  verifiedCaregivers: number;
  pendingApprovals: number;
  activeSessions: number;
};

type UserType = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  phone: string;
  profilePhoto: string | null;
  approvalStatus?: string;
  createdAt: string;
};

type CaregiverType = {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    isActive: boolean;
  };
  phone: string;
  experience: number;
  hourlyRate: number;
  approvalStatus: string;
  skills: string[];
  languages: string[];
  bio: string;
  profilePhoto: string | null;
  idProof: string | null;
  age: number;
  gender: string;
};

type BookingType = {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  hours: number;
  paymentStatus: string;
  clientName: string;
  clientEmail: string;
  caregiverName: string;
  familyMemberName: string;
  createdAt: string;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-600",
    unpaid: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-600",
  };
  return map[status] || "bg-gray-100 text-gray-600";
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [stats, setStats] = useState<StatsType | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverType[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [caregiverPage, setCaregiverPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    setSearch("");
    if (activeSection === "overview") fetchOverview();
    if (activeSection === "users") fetchUsers();
    if (activeSection === "caregivers") fetchCaregivers();
    if (activeSection === "bookings") fetchBookings();
  }, [activeSection]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        getAdminStats(),
        getPendingCaregivers(),
      ]);
      setStats(statsRes.data);
      setCaregivers(pendingRes.data);
    } catch {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchCaregivers = async () => {
    setLoading(true);
    try {
      const res = await getAllCaregivers();
      setCaregivers(res.data);
    } catch {
      console.error("Failed to fetch caregivers");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getAllBookings();
      setBookings(res.data);
    } catch {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    await approveCaregiver(id);
    fetchCaregivers();
    setSelectedCaregiver(null);
  };

  const handleReject = async (id: string) => {
    await rejectCaregiver(id);
    fetchCaregivers();
    setSelectedCaregiver(null);
  };

  const handleToggleUser = async (id: string) => {
    await toggleUserActive(id);
    fetchUsers();
  };

  const openCaregiverDetail = async (id: string) => {
    const res = await getCaregiverById(id);
    setSelectedCaregiver(res.data);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCaregivers = caregivers.filter(
    (c) =>
      c.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBookings = bookings.filter(
    (b) =>
      b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.caregiverName.toLowerCase().includes(search.toLowerCase())
  );

    // Users Pagination
  const totalUserPages = Math.ceil(
    filteredUsers.length / ITEMS_PER_PAGE
  );

  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * ITEMS_PER_PAGE,
    userPage * ITEMS_PER_PAGE
  );

  // Caregivers Pagination
  const totalCaregiverPages = Math.ceil(
    filteredCaregivers.length / ITEMS_PER_PAGE
  );

  const paginatedCaregivers = filteredCaregivers.slice(
    (caregiverPage - 1) * ITEMS_PER_PAGE,
    caregiverPage * ITEMS_PER_PAGE
  );

  // Bookings Pagination
  const totalBookingPages = Math.ceil(
    filteredBookings.length / ITEMS_PER_PAGE
  );

  const paginatedBookings = filteredBookings.slice(
    (bookingPage - 1) * ITEMS_PER_PAGE,
    bookingPage * ITEMS_PER_PAGE
  );

  const renderOverview = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 text-sm">
          Welcome back, Admin. Here&apos;s what&apos;s happening on Nivaran.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Active accounts"
          />
          <StatCard
            title="Verified Caregivers"
            value={stats.verifiedCaregivers}
            subtitle="Approved and active"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            subtitle="Awaiting review"
          />
          <StatCard
            title="Active Sessions"
            value={stats.activeSessions}
            subtitle="Currently confirmed"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[
          {
            title: "Manage Users",
            desc: "View and manage all registered clients and caregivers",
            action: "users",
            color: "#3b82f6",
          },
          {
            title: "Review Caregivers",
            desc: "Approve or reject caregiver registrations",
            action: "caregivers",
            color: "#2E4E3F",
          },
          {
            title: "View Bookings",
            desc: "Monitor all booking activity on the platform",
            action: "bookings",
            color: "#7c3aed",
          },
        ].map((card) => (
          <div
            key={card.action}
            onClick={() => setActiveSection(card.action)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition group"
          >
            <div
              className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
              style={{
                backgroundColor: card.color + "20",
              }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: card.color,
                }}
              />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-500">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">All Users</h1>
          <p className="text-sm text-gray-500">{filteredUsers.length} users found</p>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email..."
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["User", "Email", "Role", "Joined", "Status", "Action"].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white text-sm overflow-hidden flex-shrink-0"
                        style={{
                          backgroundColor: "#2E4E3F",
                        }}
                      >
                        {user.profilePhoto ? (
                          <img
                            src={`http://localhost:3000/uploads/${user.profilePhoto}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.fullName.charAt(0)
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {user.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        user.role === "caregiver"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleUser(user._id)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                        user.isActive
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-green-200 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          disabled={userPage === 1}
          onClick={() => setUserPage((prev) => prev - 1)}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalUserPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setUserPage(i + 1)}
            className={`px-4 py-2 rounded-lg border ${
              userPage === i + 1
                ? "bg-[#2E4E3F] text-white"
                : "bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={userPage === totalUserPages}
          onClick={() => setUserPage((prev) => prev + 1)}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderCaregivers = () => (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Caregivers</h1>
          <p className="text-sm text-gray-500">
            {filteredCaregivers.length} caregivers found
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search caregivers..."
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Caregiver", "Email", "Experience", "Rate", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredCaregivers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No caregivers found
                </td>
              </tr>
            ) : (
              paginatedCaregivers.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white text-sm overflow-hidden flex-shrink-0"
                        style={{
                          backgroundColor: "#2E4E3F",
                        }}
                      >
                        {c.profilePhoto ? (
                          <img
                            src={`http://localhost:3000/uploads/${c.profilePhoto}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          c.user?.fullName?.charAt(0)
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {c.user?.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.user?.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {c.experience} yrs
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Rs. {c.hourlyRate}/hr
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        c.approvalStatus
                      )}`}
                    >
                      {c.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openCaregiverDetail(c._id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                      >
                        View
                      </button>
                      {c.approvalStatus === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(c._id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(c._id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          disabled={caregiverPage === 1}
          onClick={() => setCaregiverPage((prev) => prev - 1)}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalCaregiverPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCaregiverPage(i + 1)}
            className={`px-4 py-2 rounded-lg border ${
              caregiverPage === i + 1
                ? "bg-[#2E4E3F] text-white"
                : "bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={caregiverPage === totalCaregiverPages}
          onClick={() => setCaregiverPage((prev) => prev + 1)}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">All Bookings</h1>
          <p className="text-sm text-gray-500">
            {filteredBookings.length} bookings found
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by client or caregiver..."
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[
                "Client",
                "Caregiver",
                "Family Member",
                "Date",
                "Amount",
                "Status",
                "Payment",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  No bookings found
                </td>
              </tr>
            ) : (
             paginatedBookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {b.clientName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {b.caregiverName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {b.familyMemberName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(b.date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    Rs. {b.totalAmount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        b.paymentStatus
                      )}`}
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
        <div className="flex justify-center items-center gap-2 mt-6">
        <button
          disabled={bookingPage === 1}
          onClick={() => setBookingPage((prev) => prev - 1)}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalBookingPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setBookingPage(i + 1)}
            className={`px-4 py-2 rounded-lg border ${
              bookingPage === i + 1
                ? "bg-[#2E4E3F] text-white"
                : "bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={bookingPage === totalBookingPages}
          onClick={() => setBookingPage((prev) => prev + 1)}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderCaregiverModal = () => {
    if (!selectedCaregiver) return null;
    return (
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
        <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Caregiver Profile</h2>
            <button
              onClick={() => setSelectedCaregiver(null)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                {selectedCaregiver.profilePhoto ? (
                  <img
                    src={`http://localhost:3000/uploads/${selectedCaregiver.profilePhoto}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-white text-xl"
                    style={{
                      backgroundColor: "#2E4E3F",
                    }}
                  >
                    {selectedCaregiver.user?.fullName?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {selectedCaregiver.user?.fullName}
                </h3>
                <p className="text-gray-500 text-sm">{selectedCaregiver.user?.email}</p>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium mt-1 inline-block ${getStatusBadge(
                    selectedCaregiver.approvalStatus
                  )}`}
                >
                  {selectedCaregiver.approvalStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
              {[
                ["Phone", selectedCaregiver.phone],
                ["Age", selectedCaregiver.age],
                ["Gender", selectedCaregiver.gender],
                ["Experience", `${selectedCaregiver.experience} yrs`],
                ["Hourly Rate", `Rs. ${selectedCaregiver.hourlyRate}`],
                ["Bank Account", selectedCaregiver.bankAccount],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-gray-800">{value || "-"}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCaregiver.skills?.map((s: string) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Languages
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCaregiver.languages?.map((l: string) => (
                    <span
                      key={l}
                      className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {selectedCaregiver.bio && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Bio
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedCaregiver.bio}
                </p>
              </div>
            )}

            {selectedCaregiver.idProof && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  ID Proof
                </p>
                <a
                  href={`http://localhost:3000/uploads/${selectedCaregiver.idProof}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  View Document
                </a>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
            <button
              onClick={() => setSelectedCaregiver(null)}
              className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
            >
              Close
            </button>
            {selectedCaregiver.approvalStatus === "pending" && (
              <>
                <button
                  onClick={() => handleApprove(selectedCaregiver._id)}
                  className="px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedCaregiver._id)}
                  className="px-5 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <AdminSidebar active={activeSection} onNavigate={setActiveSection} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        ) : (
          <>
            {activeSection === "overview" && renderOverview()}
            {activeSection === "users" && renderUsers()}
            {activeSection === "caregivers" && renderCaregivers()}
            {activeSection === "bookings" && renderBookings()}
          </>
        )}
      </main>

      {renderCaregiverModal()}
    </div>
  );
};

const SearchBar = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div className="relative">
    <Search
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2E4E3F] w-full sm:w-72"
    />
  </div>
);

export default AdminDashboard;
