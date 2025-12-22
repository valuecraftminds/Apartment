import React from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/register');
  };

  return (
    <div className="welcomePage">
      {/* Header Section with responsive adjustments */}
      {/* <div className="absolute top-4 left-4 sm:left-6 flex items-center gap-2 mt-5">
        <img
          src="/apartment.png"
          alt="Apartment Logo"
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12"
        />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">AptSync</h2>
      </div> */}

      {/* Buttons with responsive sizing and positioning */}
      <div className="absolute top-4 right-2 sm:right-6 flex gap-2 sm:gap-4 md:gap-6 mt-5">
        <button 
          onClick={() => navigate("/login")} 
          className="signInSignUp"
        >
          Sign In
        </button>
        <button 
          onClick={() => navigate("/register")} 
          className="signInSignUp"
        >
          Sign Up
        </button>
      </div>
      
      {/* Main Card - Keep EXACTLY as it was */}
      <div className="welcomeCard">
        {/* Logo / Icon */}
        <img
          src="/apartment.png"
          alt="Apartment Logo"
          className="animate-pulse w-28 sm:w-36 md:w-44 mx-auto mb-6"
        />

        {/* Title */}
        <h1 className="welcomeTitle">
          Welcome to <span className="text-yellow-300">AptSync</span>
        </h1>

        {/* Subtitle */}
        <p className="welcomeSubtitle">
          The all-in-one platform to manage residents, 
          maintenance, and keep your community thriving.
        </p>

        {/* Features */}
        <div className="featureGrid">
          <div className="featureItem">📋 Resident Records</div>
          <div className="featureItem">💳 Role Management</div>
          <div className="featureItem">🛠 Maintenance Requests</div>
          <div className="featureItem">📢 Announcements</div>
        </div>

        {/* CTA */}
        <button className="welcomeButton" onClick={handleNavigation}>🚀 Get Started</button>
      </div>
    </div>
  );
}
