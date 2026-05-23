import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo/logo_white.png";
import RoleSelectModal from "./RoleSelectModal";

const Header = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  return (
      <>
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">

          {/* Logo */}
          <img
            src={logo}
            alt="Nivaran Logo"
            className="h-14 w-auto cursor-pointer"
            onClick={() => navigate("/")}
          />

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-10 text-lg font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-[#2E4E3F] font-semibold"
                  : "text-gray-700 hover:text-[#2E4E3F]"
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "text-[#2E4E3F] font-semibold"
                  : "text-gray-700 hover:text-[#2E4E3F]"
              }
            >
              About
            </NavLink>

            <NavLink
              to="/services"
              className={({ isActive }) =>
                isActive
                  ? "text-[#2E4E3F] font-semibold"
                  : "text-gray-700 hover:text-[#2E4E3F]"
              }
            >
              Services
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? "text-[#2E4E3F] font-semibold"
                  : "text-gray-700 hover:text-[#2E4E3F]"
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 border rounded-full"
            >
              Sign In
            </button>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-[#3e5439] text-white px-6 py-2 rounded-full"
            >
              Sign Up
            </button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen
              ? <X className="w-6 h-6 text-gray-700" />
              : <Menu className="w-6 h-6 text-gray-700" />
            }
          </button>

        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-base font-medium ${
                  isActive
                    ? "text-[#2E4E3F] font-semibold"
                    : "text-gray-700"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-base font-medium ${
                  isActive
                    ? "text-[#2E4E3F] font-semibold"
                    : "text-gray-700"
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-base font-medium ${
                  isActive
                    ? "text-[#2E4E3F] font-semibold"
                    : "text-gray-700"
                }`
              }
            >
              Services
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-base font-medium ${
                  isActive
                    ? "text-[#2E4E3F] font-semibold"
                    : "text-gray-700"
                }`
              }
            >
              Contact
            </NavLink>
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="flex-1 px-4 py-2 border rounded-full text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setOpenModal(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 bg-[#3e5439] text-white px-4 py-2 rounded-full text-sm"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </header>

      <RoleSelectModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};

export default Header;
