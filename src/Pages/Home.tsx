import { ShieldCheck, MapPin, Clock } from "lucide-react";
import { NavLink } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg-[#F4F4F4]">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-28 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div>
          <h1 className="text-5xl font-bold leading-tight text-gray-900">
            Quality Care <br />
            <span className="text-[#2E4E3F]">
              Starts at Home
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
            Nivaran connects busy families with professional, verified
            caregivers. We ensure safety, transparency, and high-quality
            care through live tracking and real-time task monitoring.
          </p>

          <div className="mt-8 flex gap-5">
            <NavLink
                to="/register/client"
                className="bg-[#3e5439] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#243d31] transition"
            >
                Find a Caregiver →
            </NavLink>

            <NavLink
                to="/services"
                className="bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
            >
                View Our Services
            </NavLink>
          </div>

        </div>

        {/* Right Image */}
        <div>
          <img
            src="/image.png"
            alt="Caregiver helping elderly"
            className="rounded-lg shadow-md w-full object-cover"
            />
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="max-w-6xl mx-auto px-8 pb-28 text-center">
        <p className="uppercase text-sm tracking-widest text-gray-500 font-semibold">
          Why Choose Nivaran?
        </p>

        <h2 className="text-4xl font-bold mt-4 text-gray-900">
          Comprehensive Care Solutions
          <br />
          <span className="text-[#2E4E3F]">
            with Cutting-Edge Technology
          </span>
        </h2>

        {/* Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
              <ShieldCheck className="text-[#2E4E3F]" />
            </div>

            <h3 className="mt-6 text-xl font-semibold text-gray-900">
              Verified Caregivers
            </h3>

            <p className="mt-4 text-gray-600 leading-relaxed">
              All caregivers are thoroughly vetted, background-checked,
              and admin-approved to ensure the highest standards of care
              and safety.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
              <MapPin className="text-[#2E4E3F]" />
            </div>

            <h3 className="mt-6 text-xl font-semibold text-gray-900">
              Real-Time GPS Tracking
            </h3>

            <p className="mt-4 text-gray-600 leading-relaxed">
              Monitor caregiver locations during service hours for
              complete transparency and peace of mind about your loved
              ones.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
              <Clock className="text-[#2E4E3F]" />
            </div>

            <h3 className="mt-6 text-xl font-semibold text-gray-900">
              Flexible Scheduling
            </h3>

            <p className="mt-4 text-gray-600 leading-relaxed">
              Book caregivers based on availability and your schedule.
              Easy filtering by skills, experience, and time slots.
            </p>
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="text-center pb-28">
        <h2 className="text-4xl font-bold text-gray-900">
          Ready to join our community?
        </h2>

        <p className="mt-4 text-gray-600">
          Experience a digital solution designed to give peace to families
          who need help at home.
        </p>

        <div className="mt-8 flex justify-center gap-6">
            <NavLink
                to="/register/caregiver"
                className="bg-[#3e5439] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#243d31] transition"
            >
                Get Started Now
            </NavLink>

            <NavLink
                to="/contact"
                className="bg-white border border-gray-300 px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
            >
                Contact Support
            </NavLink>
        </div>

      </section>

    </div>
  );
};

export default Home;
