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
    setIsSending(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("📧 Password reset link sent! Check your inbox.");
      setEmail(""); // Clear email after success
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="absolute top-4 left-6 flex -6 mt-5">
        <button 
          onClick={handleBackToLogin}
          className="flex items-center gap-2 mb-4 text-white hover:text-black transition-colors"
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
          {/* <img
                src="/favicon.ico"
                alt="AptSync Logo"
                className="w-10 h-10"
          /> */}
          <h1 className="font-bold text-xl text-center">Forgot Password</h1>
          <p className="text-gray-600 mb-6 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              className="loginInput mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="loginButton loginButton--submit w-full"
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        
          <p className="mt-4 text-sm text-center text-gray-600">
            Remember your password?{" "}
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-purple-700 hover:underline"
            >
              Back to Login
            </button>
          </p>
        </div> 
      </div>
      
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}