//ForgotPassword.jsx
import React, { useState } from "react";
import api from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!email) {
    toast.error("Please enter your email address");
    return;
  }

  setIsSending(true);
  try {
    // Use the unified forgot-password endpoint
    await api.post('/auth/forgot-password-unified', { email });
    toast.success("📧 Password reset link sent! Check your inbox.");
    setEmail(""); // Clear email after success
    
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Something went wrong";
    toast.error(errorMessage);
  } finally {
    setIsSending(false);
  }
};

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="absolute top-4 left-6 flex items-center gap-3 mt-5">
        <button 
          onClick={handleBackToLogin}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          title="Back to Login"
        >
          <ArrowLeft size={20} />
        </button>
        <img
          src="/apartment.png"
          alt="Apartment Logo"
          className="w-10 h-10"
        />
        <h2 className="text-2xl font-bold text-white">AptSync</h2>
      </div>
      <div className="loginPage">
        <div className="loginCard animate-fadeIn">
          <div className="flex justify-center mb-4">
            <img
              src="/favicon.ico"
              alt="AptSync Logo"
              className="w-12 h-12"
            />
          </div>
          
          <h1 className="font-bold text-xl text-center mb-2">Reset Password</h1>
          <p className="text-gray-600 mb-6 text-sm text-center">
            Enter your email address and we'll send you a password reset link.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="loginInput w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isSending}
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll check if you're an admin, employee, or house owner automatically.
              </p>
            </div>
            
            <button
              type="submit"
              className="loginButton loginButton--submit w-full flex items-center justify-center py-3"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Reset Link...
                </>
              ) : (
                "Send Password Reset Link"
              )}
            </button>
          </form>

          {/* Help Text */}
          

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-purple-700 dark:text-purple-400 hover:underline text-center font-medium py-2"
              >
                ← Back to Login
              </button>
              
              <p className="text-gray-500 dark:text-gray-400 text-xs text-center">
                Don't have an account? Contact your apartment administrator.
              </p>
            </div>
          </div>
        </div> 
      </div>
      
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}