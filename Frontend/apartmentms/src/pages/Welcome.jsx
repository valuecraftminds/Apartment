import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate=useNavigate();

  const handleNavigation= ()=>{
    navigate('/register');
  }
    return (
    <div className="welcomePage">
      <div className="absolute top-4 right-6 flex gap-4">
        <button 
          onClick={() => navigate("/login")} 
          className="px-4 py-2 rounded-lg bg-transparent hover:bg-gray-300 font-medium"
        >
          Sign In
        </button>
        <button 
          onClick={() => navigate("/register")} 
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
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
          The all-in-one platform to manage residents, track payments, schedule
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
