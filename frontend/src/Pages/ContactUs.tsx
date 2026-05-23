import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Send,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { sendContactMessage } from "../api/authApi";

const Contact = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await sendContactMessage(formData);
      setSent(true);
      setFormData({
        fullName: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Failed to send message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const faqs = [
    {
      question: "How quickly can I get a caregiver?",
      answer:
        "In most cases, caregivers can be arranged within 24–48 hours depending on availability and your specific requirements.",
    },
    {
      question: "Are the caregivers medically trained?",
      answer:
        "All caregivers are verified and background-checked. Some have medical training depending on the type of service required.",
    },
    {
      question: "What happens if a caregiver doesn’t show up?",
      answer:
        "We immediately arrange a replacement caregiver and notify you with real-time updates to ensure uninterrupted service.",
    },
  ];

  return (
    <div className="bg-[#f4f4f4] py-24">
      <div className="max-w-6xl mx-auto px-6">

        {/* PAGE HEADER */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest text-[#2E4E3F] uppercase mb-3">
            Contact Us
          </p>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            We’d Love to Hear From You
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about our services? Our team is here to help you every step of the way.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* LEFT: CONTACT FORM */}
          <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Send us a message
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* Name + Email */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="w-full mt-2 bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E4E3F]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                    className="w-full mt-2 bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E4E3F]"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Inquiry Subject"
                  required
                  className="w-full mt-2 bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E4E3F]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Message
                </label>
                <textarea
                  rows={5}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we assist you?"
                  required
                  className="w-full mt-2 bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E4E3F] resize-none"
                />
              </div>

              {/* Submit Button */}
              {error && (
                <p className="text-red-500 text-sm text-center">
                  {error}
                </p>
              )}

              {sent && (
                <div className="text-center py-2">
                  <p className="text-[#2E4E3F] font-semibold">
                    ✓ Message sent successfully!
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    We'll get back to you within 24–48 hours.
                    Check your email for confirmation.
                  </p>
                </div>
              )}

              {!sent && (
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-[#3e5439] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#243d31] transition flex items-center justify-center gap-3 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send Message"}
                  {!sending && <Send size={18} />}
                </button>
              )}
            </form>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-8">

            {/* SIMPLE GREEN GET IN TOUCH CARD */}
            <div className="bg-[#3e5439] text-white rounded-3xl p-10 shadow-lg">
              <h3 className="text-xl font-bold mb-8">
                Get in Touch
              </h3>

              <div className="space-y-6 text-gray-100">
                <div className="flex items-center gap-4">
                  <Mail size={20} />
                  <span>nivaran@gmail.com</span>
                </div>

                <div className="flex items-center gap-4">
                  <Phone size={20} />
                  <span>+977-XXXXXXXXXX</span>
                </div>

                <div className="flex items-center gap-4">
                  <MapPin size={20} />
                  <span>Kathmandu, Nepal</span>
                </div>
              </div>
            </div>

            {/* VERIFIED CARD */}
            <div className="bg-white rounded-3xl shadow-md p-6 border border-gray-100 flex items-start gap-4">
              <ShieldCheck className="text-[#2E4E3F]" />
              <div>
                <h4 className="font-semibold text-gray-900">
                  Verified & Secure
                </h4>
                <p className="text-gray-600 text-sm">
                  All communications are confidential and handled by certified care coordinators.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Common Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-100 shadow-sm"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex justify-between items-center p-5 text-left font-medium text-gray-900"
                >
                  {faq.question}
                  <ChevronDown
                    className={`transition ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openIndex === index && (
                  <div className="px-5 pb-5 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
