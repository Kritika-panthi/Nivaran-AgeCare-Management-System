import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo/logo_green.png";

const Footer = () => {
  return (
    <footer className="bg-[#3e5439] text-white">
      <div className="max-w-7xl mx-auto px-20 py-16 flex flex-col md:flex-row justify-between gap-16">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col max-w-sm space-y-6">
          <img
            src={logo}
            alt="Nivaran Logo"
            className="h-18 w-45 mb-2"
          />

          <p className="text-gray-200 text-lg leading-relaxed">
            Quality care for your loved ones,
            <br />
            anytime, anywhere.
          </p>

          <div className="flex space-x-6">
            <a href="#" className="hover:text-gray-300 transition">
              <Instagram size={22} />
            </a>
            <a href="#" className="hover:text-gray-300 transition">
              <Facebook size={22} />
            </a>
            <a href="#" className="hover:text-gray-300 transition">
              <Linkedin size={22} />
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="flex flex-col space-y-6 py-4">
          <h3 className="text-lg font-semibold tracking-wide uppercase">
            Quick Link
          </h3>

          <ul className="flex flex-col space-y-4 text-gray-200 text-lg">
            <li>
              <Link to="/services" className="hover:text-white transition">
                Services
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition">
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="flex flex-col space-y-6 py-4">
          <h3 className="text-lg font-semibold tracking-wide uppercase">
            Get in Touch
          </h3>

          <div className="flex flex-col space-y-5 text-gray-200 text-lg">
            <div className="flex items-center space-x-4">
              <Mail size={20} />
              <span>nivaran@gmail.com</span>
            </div>

            <div className="flex items-center space-x-4">
              <Phone size={20} />
              <span>+977-XXXXXXXXXX</span>
            </div>

            <div className="flex items-center space-x-4">
              <MapPin size={20} />
              <span>Kathmandu, Nepal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/20 mx-32"></div>

      {/* Bottom */}
      <div className="text-center py-8 text-gray-300 text-lg">
        &copy; {new Date().getFullYear()} Nivaran Age Care Services. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
