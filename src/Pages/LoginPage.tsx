import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Input } from "../Components/Form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { loginUser, googleLoginApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import RoleSelectModal from "../Components/RoleSelectModal";
import Toast, { type ToastType } from "../Components/Toast";

type LoginFormData = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("rememberMe") === "true";
  });

  const [savedEmail] = useState(() => {
    return localStorage.getItem("savedEmail") || "";
  });

  const [formData, setFormData] = useState<LoginFormData>({
    email: savedEmail,
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = (
    message: string,
    type: ToastType = "error"
  ) => {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  };

  const hideToast = () => setToast(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser({
        ...formData,
        rememberMe,
      });

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("savedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("savedEmail");
      }

      login(res.data.token, res.data.role, res.data.fullName);


      if (res.data.role === "admin") {
        navigate("/admin");
      } else if (res.data.role === "caregiver") {
        navigate("/caregiver");
      } else {
        navigate("/client");
      }

    } catch (error: any) {
    console.log("FULL ERROR:", error);

    const status = error?.response?.status;
    const message =
      error?.response?.data?.message || "";

    let errorMessage = "Login failed";

    if (status === 404) {
      errorMessage = "User not found";
    } else if (status === 400) {
      errorMessage = "Invalid credentials";
    } else if (status === 403) {
      errorMessage = message;
    } else if (message) {
      errorMessage = message;
    }

    showToast(errorMessage, "error");

    console.log("Toast shown:", errorMessage);

  } finally {
    setLoading(false);
  }
};

  const handleGoogleSuccess = async (
    credentialResponse: any
  ) => {
    try {
      setLoading(true);
      const res = await googleLoginApi({
        credential: credentialResponse.credential,
      });

      login(
        res.data.token,
        res.data.role,
        res.data.fullName
      );

      if (!res.data.profileComplete) {
        navigate("/client/complete-profile");
      } else {
        navigate("/client");
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
        "Google login failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <>
    <RoleSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
    />
    {/* Fixed toast notification at top of screen */}
    {toast && (
  <div
    className="fixed top-5 left-1/2
               -translate-x-1/2
               z-[99999]
               w-full max-w-md px-4"
  >
    <Toast
    key={toast.id}
      message={toast.message}
      type={toast.type}
      onClose={hideToast}
      duration={5000}
    />
  </div>
)}
    {/* left side section */}
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">

        <div className="hidden md:flex flex-col justify-center px-12 bg-[#323e26] text-white">
          <h1 className="text-4xl font-semibold mb-6 leading-snug">
            Welcome <br /> Back to Nivaran
          </h1>
          <p className="text-gray-200 max-w-sm leading-relaxed">
            Your trusted space for managing care and ensuring family well-being.
          </p>
        </div>

       {/* Hanldling Login form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center px-8 md:px-14 py-10 relative"
        >
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </button>
          <h2 className="text-3xl font-semibold mb-2">Sign In</h2>
          <p className="text-gray-500 mb-8">
            Enter your credentials to continue
          </p>

          <div className="mb-5">
            <Input
              label="EMAIL ADDRESS"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <Input
              label="PASSWORD"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: "#323e26" }}
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-[#323e26] hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#323e26] text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showToast("Google login failed", "error")}
              useOneTap={false}
              text="continue_with"
              shape="rectangular"
              width="320"
            />
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="font-medium text-[#323e26] hover:underline"
              >
                Create one now
              </button>
          </p>
        </form>
      </div>
    </div>
  </>
  );
};

export default LoginPage;
