import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate=useNavigate();

  const handleNavigation= ()=>{
    navigate('/companyregistration');
  }
    return (
    <div className="welcomePage">
      <div className="absolute top-4 left-6 flex -6 mt-5">
        <img
          src="/apartment.png"
          alt="Apartment Logo"
          className="w-12 sm:w-10 md:w-11 mx-auto mb-6"
        />
        <h2 className="text-3xl sm:text-3xl md:text-3xl font-bold text-white mb-4">AptSync</h2>
      </div>

      <div className="absolute top-4 right-6 flex gap-6 mt-6">
        <button 
          onClick={() => navigate("/login")} 
          className="signInSignUp"
        >
          Sign In
        </button>
        <button 
          onClick={() => navigate("/companyregistration")} 
          className="signInSignUp"
        >
          Sign Up
        </button>
      </div>
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
