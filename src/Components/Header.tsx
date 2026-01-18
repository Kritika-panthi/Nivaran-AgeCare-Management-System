import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo/logo_white.png";
import RoleSelectModal from "./RoleSelectModal";

const Header = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

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
          <div className="flex gap-4">
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

        </div>
      </header>

      <RoleSelectModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};

export default Header;
