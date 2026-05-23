import {
  Bell,
  UserCircle,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/authApi";
import logo from "../assets/logo/logo_white.png";

// Type for notification object
type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

// Helper function to format date and time
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { role, fullName, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] =
    useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const displayName = role === "admin" ? "Admin" : fullName;

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfile = () => {
    if (role === "client") navigate("/client/profile");
    if (role === "caregiver") navigate("/caregiver/profile");
    setOpen(false);
  };

   // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

   // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadNotificationCount();
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error("Failed to fetch unread count");
    }
  };

  // Handle bell icon click
  const handleBellClick = async () => {
    const next = !notificationOpen;
    setNotificationOpen(next);

    // When opening, fetch notifications and count
    if (!notificationOpen) {
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  // Mark a single notification as read
  const handleNotificationClick = async (id: string) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );

      // Decrease unread count
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("Failed to mark notification as read");
    }
  };

  // Fetch unread count on mount and refresh every 10 seconds
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
       // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read");
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }

      // Close notification dropdown
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <img
          src={logo}
          alt="Nivaran Logo"
          className="h-14 cursor-pointer"
          onClick={() => navigate("/")}
        />

        {role === "client" && (
          <nav className="hidden md:flex gap-6 lg:gap-10 font-medium text-gray-600">
            <NavLink to="/client" className="hover:text-[#2E4E3F]">
              Dashboard
            </NavLink>
            <NavLink to="/client/findcaregiver" className="hover:text-[#2E4E3F]">
              Find Caregiver
            </NavLink>
            <NavLink to="/client/trackcaregiver" className="hover:text-[#2E4E3F]">
              Track Caregiver
            </NavLink>
          </nav>
        )}

        {role === "caregiver" && (
          <nav className="hidden md:flex gap-6 lg:gap-10 font-medium text-gray-600">
            <NavLink
              to="/caregiver"
              end
              className="hover:text-[#2E4E3F]"
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/caregiver/availability"
              className="hover:text-[#2E4E3F]"
            >
              Availability
            </NavLink>
          </nav>
        )}

        <div className="flex items-center gap-4 sm:gap-8 relative">

          {/* Notification Bell */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={handleBellClick}
              className="relative cursor-pointer"
            >
              <Bell className="w-6 h-6 text-gray-600 hover:text-[#2E4E3F] transition" />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <>
                {/* ── MOBILE: full screen overlay ── */}
                <div className="fixed inset-0 z-50 flex flex-col bg-white sm:hidden">
                  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-800 text-base">
                      Notifications
                    </h3>
                    <div className="flex items-center gap-3">
                      {notifications.length > 0 &&
                        unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-sm text-[#2E4E3F] font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      <button
                        onClick={() => setNotificationOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-sm text-gray-500 text-center">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() =>
                            handleNotificationClick(n._id)
                          }
                          className={`px-4 py-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                            !n.isRead
                              ? "bg-green-50"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-800">
                                {n.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                {n.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDateTime(n.createdAt)}
                              </p>
                            </div>
                            {!n.isRead && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#2E4E3F] mt-1 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* ── DESKTOP: dropdown as before ── */}
                <div className="hidden sm:block absolute right-0 mt-4 w-[360px] bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-800">
                      Notifications
                    </h3>
                    {notifications.length > 0 &&
                      unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-sm text-[#2E4E3F] font-medium hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-gray-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() =>
                            handleNotificationClick(n._id)
                          }
                          className={`px-4 py-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                            !n.isRead
                              ? "bg-green-50"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-sm text-gray-800">
                                {n.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {n.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDateTime(n.createdAt)}
                              </p>
                            </div>
                            {!n.isRead && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#2E4E3F] mt-2 shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Dropdown */}
          <div ref={dropdownRef} className="relative">
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 sm:gap-3 border px-3 sm:px-6 py-2 rounded-full cursor-pointer hover:shadow-md transition"
            >
              <span className="font-medium hidden sm:inline">
                {displayName}
              </span>

              <div className="bg-gray-100 p-2 rounded-full">
                <UserCircle className="w-5 h-5 text-gray-600" />
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>

            {open && (
              <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg py-2 animate-fadeIn z-50">
                {role !== "admin" && (
                  <button
                    onClick={handleProfile}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                    <UserCircle className="w-4 h-4" />
                    Profile
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-gray-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
          {(role === "client" || role === "caregiver") && (
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition ml-2"
              onClick={() =>
                setMobileNavOpen(!mobileNavOpen)
              }
            >
              {mobileNavOpen
                ? <X className="w-5 h-5 text-gray-600" />
                : <Menu className="w-5 h-5 text-gray-600" />
              }
            </button>
          )}
        </div>
      </div>
      {mobileNavOpen && (
        role === "client" || role === "caregiver"
      ) && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {role === "client" && (
            <>
              <NavLink
                to="/client"
                end
                onClick={() => setMobileNavOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/client/findcaregiver"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Find Caregiver
              </NavLink>
              <NavLink
                to="/client/trackcaregiver"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Track Caregiver
              </NavLink>
            </>
          )}
          {role === "caregiver" && (
            <>
              <NavLink
                to="/caregiver"
                end
                onClick={() => setMobileNavOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/caregiver/availability"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Availability
              </NavLink>
              <NavLink
                to="/caregiver/profile"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Profile
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
