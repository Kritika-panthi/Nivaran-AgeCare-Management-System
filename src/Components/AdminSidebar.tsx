import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo/logo_green.png";

type Props = {
  active: string;
  onNavigate: (section: string) => void;
};

const navItems = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    key: "users",
    label: "Users",
    icon: Users,
  },
  {
    key: "caregivers",
    label: "Caregivers",
    icon: UserCheck,
  },
  {
    key: "bookings",
    label: "Bookings",
    icon: CalendarDays,
  },
];

const AdminSidebar = ({ active, onNavigate }: Props) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
    {/* Mobile top bar */}
    <div
      className="lg:hidden flex items-center justify-between px-4 py-3 shadow-md"
      style={{ backgroundColor: "#3e5439" }}
    >
      <img
        src={logo}
        alt="Nivaran"
        className="h-10 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="text-white p-1"
      >
        {collapsed
          ? <X className="w-6 h-6" />
          : <Menu className="w-6 h-6" />
        }
      </button>
    </div>

    {/* Mobile dropdown nav */}
    {collapsed && (
      <div
        className="lg:hidden flex flex-col shadow-lg z-50"
        style={{ backgroundColor: "#3e5439" }}
      >
        <nav className="px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setCollapsed(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-[#2E4E3F]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    )}

    {/* Desktop sidebar */}
    <aside
      className="hidden lg:flex w-64 min-h-screen flex-col shadow-lg"
      style={{ backgroundColor: "#3e5439" }}
    >
      <div className="px-6 py-6 border-b border-white/10">
        <img
          src={logo}
          alt="Nivaran"
          className="h-12 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="px-6 py-4 border-b border-white/10">
        
        <p className="text-white font-semibold text-sm">System Admin</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-white text-[#2E4E3F]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
};

export default AdminSidebar;
