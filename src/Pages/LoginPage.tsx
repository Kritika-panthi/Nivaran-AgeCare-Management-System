import { useState } from "react";
import { Input } from "../Components/Form";
import { Link } from "react-router-dom";

type LoginFormData = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Login Data:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">

        <div className="hidden md:flex flex-col justify-center px-12 bg-[#323e26] text-white">
          <h1 className="text-4xl font-semibold mb-6 leading-snug">
            Welcome <br /> Back to Nivaran
          </h1>
          <p className="text-gray-200 max-w-sm leading-relaxed">
            Your trusted space for managing care, tracking sessions,
            and ensuring family well-being.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center px-8 md:px-14 py-14"
        >
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

          <div className="mb-6">
            <Input
              label="PASSWORD"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <div className="text-right mt-2">
              <button
                type="button"
                className="text-sm text-gray-500 hover:underline"
              >
                Forgot?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#323e26] text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
            <Link
              to="/clientregister"
              className="font-medium text-gray-800 hover:underline"
            >
              Create one now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
