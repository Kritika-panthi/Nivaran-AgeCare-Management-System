import {
  Shield,
  Baby,
  HeartPulse,
  Home,
  Utensils,
  Car,
  Check,
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: <Shield size={22} />,
      badge: "ELDERLY",
      title: "Elder Care",
      desc: "Comprehensive care for senior citizens including daily assistance, medication management, and companionship.",
      features: [
        "Personal hygiene assistance",
        "Medication reminders",
        "Meal preparation",
        "Companionship",
        "Mobility support",
      ],
    },
    {
      icon: <Baby size={22} />,
      badge: "CHILDREN",
      title: "Child Care",
      desc: "Professional childcare services for infants, toddlers, and school-age children with experienced caregivers.",
      features: [
        "Feeding and diaper care",
        "Educational activities",
        "Playtime supervision",
        "School pickup/drop-off",
        "Homework help",
      ],
    },
    {
      icon: <HeartPulse size={22} />,
      badge: "SPECIAL CARE",
      title: "Disability Support",
      desc: "Specialized care for individuals with physical or developmental disabilities requiring extra support.",
      features: [
        "Mobility assistance",
        "Therapy support",
        "Daily living activities",
        "Communication help",
        "Specialized equipment handling",
      ],
    },
    {
      icon: <Home size={22} />,
      badge: "ALL AGES",
      title: "Live-in Care",
      desc: "24/7 comprehensive care with a dedicated caregiver living in your home for continuous support.",
      features: [
        "Round-the-clock availability",
        "All daily care needs",
        "Emergency response",
        "Household light duties",
        "Complete peace of mind",
      ],
    },
    {
      icon: <Utensils size={22} />,
      badge: "DIETARY",
      title: "Meal Preparation",
      desc: "Nutritious meal planning and preparation services tailored to dietary needs and preferences.",
      features: [
        "Custom meal planning",
        "Dietary restriction adherence",
        "Fresh cooking",
        "Kitchen cleanup",
        "Grocery shopping",
      ],
    },
    {
      icon: <Car size={22} />,
      badge: "ASSISTANCE",
      title: "Transportation",
      desc: "Safe transportation services for medical appointments, errands, and social activities.",
      features: [
        "Medical appointments",
        "Grocery shopping",
        "Social outings",
        "Door-to-door service",
        "Mobility assistance",
      ],
    },
  ];

  return (
    <div className="bg-[#f4f4f4]">

      {/* HERO SECTION */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-sm font-semibold tracking-widest text-[#2E4E3F] uppercase mb-3">
            Our Services
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Comprehensive Care Solutions
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We provide a wide range of professional home care services designed
            to support individuals and families with reliability, safety, and compassion.
          </p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="max-w-7xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-10">

          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition duration-300 border border-gray-100"
            >
              {/* Icon + Badge */}
              <div className="flex justify-between items-center mb-6">
                <div className="bg-[#2E4E3F]/10 text-[#2E4E3F] w-12 h-12 flex items-center justify-center rounded-xl">
                  {service.icon}
                </div>

                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {service.badge}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {service.title}
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.desc}
              </p>

              <ul className="space-y-3 text-gray-700 text-sm">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check size={16} className="text-[#2E4E3F]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </section>


    </div>
  );
};

export default Services;
