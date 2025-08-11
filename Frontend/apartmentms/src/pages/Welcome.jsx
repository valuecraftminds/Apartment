import React, { useEffect } from "react";

export default function Welcome() {
    return (
    <div className="welcomePage">
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
        <button className="welcomeButton">🚀 Get Started</button>
      </div>
    </div>
  );
}
