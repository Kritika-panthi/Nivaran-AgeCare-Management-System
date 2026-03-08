import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../Components/StatCard";
import {
  getCaregiverDashboard,
  acceptCaregiverBooking,
  declineCaregiverBooking,
  completeCaregiverBooking,
} from "../api/authApi";
import { useAuth } from "../context/AuthContext";

type FamilyProfile = {
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  emergencyContact: string;
  livingAddress: string;
  bloodGroup: string;
  allergies: string;
  mobilityLevel: string;
  chronicConditions: string[];
  currentMedicines: string[];
  notes: string;
  photo?: string;
};

type ClientData = {
  fullName: string;
  email: string;
  phone: string;
  currentLocation: string;
  photo?: string;
};

type Booking = {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  client: ClientData;
  familyProfile: FamilyProfile;
};

type DashboardData = {
  totalEarnings: number;
  jobsCompleted: number;
  isAvailable: boolean;
  pendingBookings: Booking[];
  upcomingBookings: Booking[];
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString();

const formatTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute.toString().padStart(2, "0")} ${suffix}`;
};

const CaregiverDashboard = () => {
  const navigate = useNavigate();
  const { fullName } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  const [clientModal, setClientModal] = useState<ClientData | null>(null);
  const [familyModal, setFamilyModal] = useState<FamilyProfile | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getCaregiverDashboard();
      setData(res.data);
    } catch {
      console.error("Failed to fetch dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    await acceptCaregiverBooking(id);
    fetchDashboard();
  };

  const handleDecline = async (id: string) => {
    await declineCaregiverBooking(id);
    fetchDashboard();
  };

  const handleComplete = async (id: string) => {
    await completeCaregiverBooking(id);
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-100 px-25 py-10">
      <div className="max-w-7xl mx-auto">

        <div className="mb-14">
          <h1 className="text-4xl font-bold mb-2">
            Hello, {fullName}
          </h1>
          <p className="text-gray-500">
            You have {data.pendingBookings.length} new booking requests.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-14">
          <StatCard title="Total Earnings" value={`Rs. ${data.totalEarnings}`} />
          <StatCard title="Jobs Completed" value={data.jobsCompleted} />
          <StatCard title="Availability Status" value={data.isAvailable ? "Available" : "Unavailable"} />
        </div>

        {/* AVAILABILITY BUTTON */}
        <div className="mb-16">
          <button
            onClick={() => navigate("/caregiver/availability")}
            className="bg-[#2E4E3F] text-white px-8 py-4 rounded-xl shadow"
          >
            Manage Availability →
          </button>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">
            Pending Requests
          </h2>

          {data.pendingBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-14 text-center text-gray-400 shadow">
              No new requests
            </div>
          ) : (
            <div className="space-y-6">

              {data.pendingBookings.map((booking) => (

                <div
                  key={booking._id}
                  className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center hover:shadow-md transition"
                >

                  <div className="flex items-center gap-5">

                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 overflow-hidden">

                      {booking.client.photo ? (
                        <img
                          src={`http://localhost:3000/uploads/${booking.client.photo}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        booking.client.fullName.charAt(0)
                      )}

                    </div>

                    <div>

                      <p className="font-semibold text-lg">
                        {booking.client.fullName}
                      </p>

                      <p className="text-sm text-gray-500">
                        Family: {booking.familyProfile.fullName}
                      </p>

                      <p className="text-sm text-gray-500">
                        Location: {booking.familyProfile.livingAddress}
                      </p>

                      <div className="flex gap-3 mt-2">

                        <button
                          onClick={() => setClientModal(booking.client)}
                          className="text-sm font-medium text-[#2E4E3F] hover:underline"
                        >
                          View Client
                        </button>

                        <button
                          onClick={() => setFamilyModal(booking.familyProfile)}
                          className="text-sm font-medium text-[#2E4E3F] hover:underline"
                        >
                          View Family
                        </button>

                      </div>

                    </div>
                  </div>

                  <div className="text-center">

                    <p className="font-medium">
                      {formatDate(booking.date)}
                    </p>

                    <p className="text-sm text-gray-500">
                      {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                    </p>

                  </div>

                  <div className="font-semibold text-[#2E4E3F] text-lg">
                    Rs. {booking.totalAmount}
                  </div>

                  <div className="flex gap-3">

                    <button
                      onClick={() => handleAccept(booking._id)}
                      className="px-5 py-2 rounded-lg bg-[#2E4E3F] text-white"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => handleDecline(booking._id)}
                      className="px-5 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50"
                    >
                      Decline
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}
        </div>


        <div>

          <h2 className="text-2xl font-semibold mb-6">
            Upcoming Work
          </h2>

          {data.upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-14 text-center text-gray-400 shadow">
              Nothing scheduled yet
            </div>
          ) : (
            <div className="space-y-6">

              {data.upcomingBookings.map((booking) => (

                <div
                  key={booking._id}
                  className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center hover:shadow-md transition"
                >

                  <div className="flex items-center gap-5">

                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 overflow-hidden">

                      {booking.client.photo ? (
                        <img
                          src={`http://localhost:3000/uploads/${booking.client.photo}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        booking.client.fullName.charAt(0)
                      )}

                    </div>

                    <div>

                      <p className="font-semibold text-lg">
                        {booking.client.fullName}
                      </p>

                      <p className="text-sm text-gray-500">
                        Family: {booking.familyProfile.fullName}
                      </p>

                      <p className="text-sm text-gray-500">
                        Location: {booking.familyProfile.livingAddress}
                      </p>

                      <div className="flex gap-3 mt-2">

                        <button
                          onClick={() => setClientModal(booking.client)}
                          className="text-sm font-medium text-[#2E4E3F] hover:underline"
                        >
                          View Client
                        </button>

                        <button
                          onClick={() => setFamilyModal(booking.familyProfile)}
                          className="text-sm font-medium text-[#2E4E3F] hover:underline"
                        >
                          View Family
                        </button>

                      </div>

                    </div>
                  </div>

                  <div className="text-center">

                    <p className="font-medium">
                      {formatDate(booking.date)}
                    </p>

                    <p className="text-sm text-gray-500">
                      {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                    </p>

                  </div>

                  <div className="font-semibold text-[#2E4E3F] text-lg">
                    Rs. {booking.totalAmount}
                  </div>

                  <button
                    onClick={() => handleComplete(booking._id)}
                    className="px-5 py-2 rounded-lg bg-[#2E4E3F] text-white"
                  >
                    Mark Complete
                  </button>

                </div>

              ))}

            </div>
          )}
        </div>

      </div>

      {/* CLIENT MODAL */}

      {clientModal && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

          <div className="bg-white w-[600px] rounded-3xl p-10 shadow-xl">

            <h2 className="text-2xl font-bold mb-6">
              Client Details
            </h2>

            <p><b>Name:</b> {clientModal.fullName}</p>
            <p><b>Email:</b> {clientModal.email}</p>
            <p><b>Phone:</b> {clientModal.phone}</p>
            <p><b>Location:</b> {clientModal.currentLocation}</p>

            <button
              onClick={() => setClientModal(null)}
              className="mt-8 bg-[#2E4E3F] text-white px-6 py-3 rounded-xl"
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* FAMILY MODAL */}

      {familyModal && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

          <div className="bg-white w-[700px] rounded-3xl p-10 shadow-xl overflow-y-auto max-h-[90vh]">

            <div className="flex items-center gap-4 mb-6">

              {familyModal.photo && (
                <img
                  src={`http://localhost:3000/uploads/${familyModal.photo}`}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}

              <div>
                <h2 className="text-xl font-bold">
                  {familyModal.fullName}
                </h2>

                <p className="text-gray-500">
                  Family Member
                </p>
              </div>

            </div>

            <div className="grid grid-cols-2 gap-4 text-gray-700">

              <p><b>Age:</b> {familyModal.age}</p>
              <p><b>Gender:</b> {familyModal.gender}</p>
              <p><b>Phone:</b> {familyModal.phone}</p>
              <p><b>Emergency Contact:</b> {familyModal.emergencyContact}</p>
              <p><b>Blood Group:</b> {familyModal.bloodGroup}</p>
              <p><b>Mobility:</b> {familyModal.mobilityLevel}</p>

              <p className="col-span-2">
                <b>Address:</b> {familyModal.livingAddress}
              </p>

              <p className="col-span-2">
                <b>Allergies:</b> {familyModal.allergies}
              </p>

              <p className="col-span-2">
                <b>Conditions:</b> {familyModal.chronicConditions?.join(", ") || "None"}
              </p>

              <p className="col-span-2">
                <b>Medicines:</b> {familyModal.currentMedicines?.join(", ") || "None"}
              </p>

              <p className="col-span-2">
                <b>Notes:</b> {familyModal.notes}
              </p>

            </div>

            <button
              onClick={() => setFamilyModal(null)}
              className="mt-8 bg-[#2E4E3F] text-white px-6 py-3 rounded-xl"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default CaregiverDashboard;