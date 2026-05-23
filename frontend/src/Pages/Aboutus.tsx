import { useState } from "react";
import { ShieldCheck, MapPin, Heart, Users, Target, Eye } from "lucide-react";
import { NavLink } from "react-router-dom";
import RoleSelectModal from "../Components/RoleSelectModal";

const About = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Role Select Modal */}
      <RoleSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    <div className="bg-[#f4f4f4]">


      <section className="max-w-7xl mx-auto px-8 py-28 grid md:grid-cols-2 gap-16 items-center">
        
        <img
          src= "/image1.png"
          alt="Caregiver helping elderly"
          className="rounded-3xl shadow-lg w-full object-cover"
        />

        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Our Core Purpose
          </h2>

          <div className="space-y-8">

  
            <div className="flex gap-5">
              <div className="bg-[#2E4E3F] text-white p-3 rounded-xl h-fit">
                <Target size={22} />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  The Aim
                </h3>
                <p className="text-gray-600 mt-2 leading-relaxed">
                  To develop a digital caregiver service system that helps book
                  reliable caregivers, monitor their activities in real time,
                  and ensure safety through automated technology.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="bg-[#2E4E3F] text-white p-3 rounded-xl h-fit">
                <Eye size={22} />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Our Vision
                </h3>
                <p className="text-gray-600 mt-2 leading-relaxed">
                  To create a world where families living abroad or far from
                  home can receive real-time updates and peace of mind
                  regarding their elderly parents or young children.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      <section className="max-w-7xl mx-auto px-8 pb-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          What Makes Us Different
        </h2>

        <div className="grid md:grid-cols-4 gap-8">

          {[
            {
              icon: <ShieldCheck />,
              title: "Verification",
              desc: "Caregivers undergo strict background checks and admin approval.",
            },
            {
              icon: <MapPin />,
              title: "Tracking",
              desc: "Real-time GPS visibility for complete family transparency.",
            },
            {
              icon: <Heart />,
              title: "Care for All",
              desc: "Specialized support for seniors, children, and individuals with disabilities.",
            },
            {
              icon: <Users />,
              title: "Reliability",
              desc: "Trusted booking system with secure automated updates.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition duration-300 border border-gray-100"
            >
              <div className="bg-[#2E4E3F]/10 text-[#2E4E3F] w-12 h-12 flex items-center justify-center rounded-xl mb-6">
                {item.icon}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {item.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-26 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Be Part of a Safer Care Ecosystem
        </h2>

        <p className="text-gray-600 max-w-xl mx-auto mb-10">
          Join a growing network dedicated to transforming home care through
          trust, technology, and transparency.
        </p>

        <div className="flex justify-center gap-6">
          <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#3e5439] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#243d31] transition"
            >
              Join Our Network
            </button>

          <NavLink
            to="/services"
            className="border border-gray-300 px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
          >
            Explore Services
          </NavLink>
        </div>
      </section>

    </div>
    </>
  );
};

export default About;
