import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function CompleteRegistration() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [isValidLink, setIsValidLink] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    country: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");

    setToken(tokenParam);
    setEmail(emailParam);

    // Validate that both token and email exist
    if (!tokenParam || !emailParam) {
      setIsValidLink(false);
      toast.error("Invalid registration link");
      return;
    }

    // Optional: verify link validity with backend
    const verifyLink = async () => {
      try {
        await api.post("/auth/verify-invite-link", { token: tokenParam, email: emailParam });
      } catch {
        setIsValidLink(false);
        toast.error("This invitation link is invalid or expired.");
      }
    };

    verifyLink();
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple client-side validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/complete-registration", {
        ...formData,
        email,
        token,
      });

      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete registration");
    } finally {
      setLoading(false);
    }
  };

  if (!isValidLink) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid or Expired Link</h2>
        <p className="text-gray-600 mb-4">Please contact your administrator for a new invitation.</p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/login")}
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-center flex-1">Complete Your Registration</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="firstname"
              placeholder="First Name"
              value={formData.firstname}
              onChange={handleChange}
              required
              className="border rounded p-2 border-purple-600 bg-white dark:bg-gray-700"
            />
            <input
              type="text"
              name="lastname"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={handleChange}
              required
              className="border rounded p-2 border-purple-600 bg-white dark:bg-gray-700"
            />
          </div>

          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            required
            className="border rounded p-2 border-purple-600 bg-white dark:bg-gray-700 w-full"
          />

          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
            className="border rounded p-2 border-purple-600 bg-white dark:bg-gray-700 w-full"
          />

          {/* Password fields */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border rounded p-2 border-purple-600 bg-white dark:bg-gray-700 w-full"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="border rounded p-2 border-purple-600 bg-white dark:bg-gray-700 w-full"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? "Registering..." : "Complete Registration"}
          </button>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
