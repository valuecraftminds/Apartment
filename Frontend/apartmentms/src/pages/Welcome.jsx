//Welcome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/register');
  };

  return (
    <div className="welcomePage">
      {/* Responsive Navigation Buttons */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 z-10">
        <button 
          onClick={() => navigate("/login")} 
          className="signInSignUp text-xs sm:text-sm md:text-base px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 whitespace-nowrap"
        >
          Sign In
        </button>
        <button 
          onClick={() => navigate("/register")} 
          className="signInSignUp text-xs sm:text-sm md:text-base px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 whitespace-nowrap"
        >
          Sign Up
        </button>
      </div>
      
      {/* Main Card with improved mobile responsiveness */}
      <div className="welcomeCard mx-3 sm:mx-4 md:mx-6 lg:mx-8">
        {/* Logo / Icon with responsive sizing */}
        <img
          src="/apartment.png"
          alt="Apartment Logo"
          className="animate-pulse w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 mx-auto mb-4 sm:mb-5 md:mb-6"
        />

        {/* Title with responsive font sizes */}
        <h1 className="welcomeTitle text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4 md:mb-5">
          Welcome to <span className="text-yellow-300 block sm:inline">AptSync</span>
        </h1>

        {/* Subtitle with responsive font sizes and padding */}
        <p className="welcomeSubtitle text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-7 md:mb-8 px-2 sm:px-4 md:px-0">
          The all-in-one platform to manage residents, 
          maintenance, and keep your community thriving.
        </p>

        {/* Features grid with responsive layout */}
        <div className="featureGrid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
          <div className="featureItem text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 py-3 px-4">
            <span className="text-lg sm:text-xl">📋</span>
            <span>Resident Records</span>
          </div>
          <div className="featureItem text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 py-3 px-4">
            <span className="text-lg sm:text-xl">💳</span>
            <span>Role Management</span>
          </div>
          <div className="featureItem text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 py-3 px-4">
            <span className="text-lg sm:text-xl">🛠</span>
            <span>Maintenance Requests</span>
          </div>
          <div className="featureItem text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 py-3 px-4">
            <span className="text-lg sm:text-xl">📢</span>
            <span>Announcements</span>
          </div>
        </div>

        {/* CTA Button with responsive sizing */}
        <button 
          className="welcomeButton text-sm sm:text-base md:text-lg font-bold py-3 px-6 sm:py-3 sm:px-8 md:py-4 md:px-10 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300" 
          onClick={handleNavigation}
        >
          🚀 Get Started
        </button>
        
        {/* Optional: Add a mobile-only hint */}
        <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-white/70 text-center block sm:hidden">
          👆 Tap buttons above to sign in or create account
        </div>
      </div>
      
      {/* Background overlay for better text readability on mobile */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20 pointer-events-none"></div>
    </div>
  );
}
