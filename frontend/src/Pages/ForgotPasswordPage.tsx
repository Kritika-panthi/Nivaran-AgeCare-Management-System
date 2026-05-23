import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/authApi";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1"
        >
          ← Back to login
        </button>

        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          Forgot Password
        </h2>

        {!sent ? (
          <>
            <p className="text-sm text-gray-500 mb-8">
              Enter your email and we'll send you a
              password reset link.
            </p>
            <form onSubmit={handleSubmit}>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#323e26] mb-6"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
                style={{ backgroundColor: "#323e26" }}
              >
                {loading
                  ? "Sending..."
                  : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-gray-800 font-semibold text-lg mb-2">
              Check your email
            </p>
            <p className="text-sm text-gray-500 mb-6">
              If that email is registered, a password
              reset link has been sent.
              It expires in 30 minutes.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-[#323e26] font-medium hover:underline"
            >
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
