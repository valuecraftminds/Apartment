import React, { useState } from "react";
import api from "../api/axios";
import { toast, ToastContainer } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("📧 Password reset link sent! Check your inbox.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="forgotPage">
      <div className="forgotCard">
        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="loginInput"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="loginButton loginButton--submit"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
