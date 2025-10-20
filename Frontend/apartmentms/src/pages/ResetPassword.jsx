import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [id, setId] = useState(null);
  const [isValidLink, setIsValidLink] = useState(true);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const idParam = searchParams.get("id");
    
    setToken(tokenParam);
    setId(idParam);
    
    // Validate that both token and id are present
    if (!tokenParam || !idParam) {
      setIsValidLink(false);
      toast.error("Invalid reset link");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setIsResetting(true);
    try {
      await api.post("/auth/reset-password", { token, id, password });
      toast.success("✅ Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (!isValidLink) {
    return (
      <div className="container">
        <div className="absolute top-4 left-6 flex -6 mt-5">
          <img
            src="/apartment.png"
            alt="Apartment Logo"
            className="w-12 sm:w-10 md:w-11 mx-auto mb-6"
          />
          <h2 className="text-3xl sm:text-3xl md:text-3xl font-bold text-white mb-4">AptSync</h2>
        </div>
        <div className="loginPage">
          <div className='loginCard animate-fadeIn'>
            <div className="flex items-center justify-center gap-2 mb-4">
                <h2 className="text-xl font-bold mb-4 text-red-600">Invalid Reset Link</h2>
              </div>
              <p className="text-gray-600 mb-4">
                  This password reset link is invalid or has expired.
              </p>
              <button
              onClick={handleBackToLogin}
              className="loginButton loginButton--submit w-full"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="absolute top-4 left-6 flex -6 mt-5">
        <button 
          onClick={handleBackToLogin}
          className="flex items-center gap-2 mb-4 text-purple-600 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <img
          src="/apartment.png"
          alt="Apartment Logo"
          className="w-12 sm:w-10 md:w-11 mx-auto mb-6"
        />
        <h2 className="text-3xl sm:text-3xl md:text-3xl font-bold text-white mb-4">AptSync</h2>
      </div>    
      <div className="loginPage">
        <div className="loginCard animate-fadeIn">
          <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="font-bold text-xl">Reset Password</h1>
          </div>
          {/* <p className="text-gray-600 mb-6 text-sm">
            Enter your new password below.
          </p> */}

          <form onSubmit={handleSubmit}>
            <div className="passwordField mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                className="loginInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
              <span
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="passwordToggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <div className="passwordField mb-6">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="loginInput"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength="6"
              />
              <span
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="passwordToggle"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <button 
              type="submit" 
              className="loginButton loginButton--submit w-full"
              disabled={isResetting}
            >
              {isResetting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>    
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}