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
    <div className="forgotPage">
      <div className="forgotCard">
        <button 
          onClick={handleBackToLogin}
          className="flex items-center gap-2 mb-4 text-purple-600 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Login
        </button>
        
        <h2 className="text-xl font-bold mb-2">Forgot Password</h2>
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
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}