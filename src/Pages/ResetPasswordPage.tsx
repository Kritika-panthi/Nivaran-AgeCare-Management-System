import { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { resetPassword } from "../api/authApi";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, email, password });
      setDone(true);
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
        "Reset failed. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">
          Invalid or missing reset link.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          Reset Password
        </h2>

        {!done ? (
          <>
            <p className="text-sm text-gray-500 mb-8">
              Enter your new password below.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#323e26]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) =>
                    setConfirm(e.target.value)
                  }
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#323e26]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 mt-2"
                style={{ backgroundColor: "#323e26" }}
              >
                {loading
                  ? "Resetting..."
                  : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-gray-800 font-semibold text-lg mb-2">
              Password reset successfully!
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-[#323e26] font-medium hover:underline"
            >
              Go to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
