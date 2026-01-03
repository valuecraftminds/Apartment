// components/HouseOwnerNavbar.jsx
import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { Bell, LogOut, Moon, Sun, Settings } from 'lucide-react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function HouseOwnerNavbar() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { auth, logout, resetActivityTimer } = useContext(AuthContext)
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    if (!auth.accessToken) return;

    const activityEvents = [
      'mousemove', 'mousedown', 'keydown', 'scroll', 'click',
      'touchstart', 'touchmove', 'wheel', 'resize', 'focus'
    ];

    const handleActivity = () => resetActivityTimer();

    activityEvents.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));

    // Handle tab visibility
    const handleVisibilityChange = () => {
      if (!document.hidden) resetActivityTimer();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, handleActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth.accessToken, resetActivityTimer]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      logout();
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      logout();
      toast.success('Logged out successfully')
      navigate('/')
    } finally {
      setShowLogoutModal(false)
    }
  }

  const confirmLogout = () => {
    setShowLogoutModal(true)
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Empty on desktop, mobile menu handled by sidebar */}
          <div className="flex items-center">
            {/* Mobile menu is handled by HouseOwnerSidebar component */}
          </div>

          {/* Right side - Notifications and user info */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Dark/Light mode toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Settings - Hidden on mobile to save space */}
            <button className="hidden sm:inline-flex p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <Settings size={20} />
            </button>

            {/* User info - Hidden on very small screens */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {auth?.user?.name?.charAt(0)?.toUpperCase() || 'H'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                  {auth?.user?.name || 'House Owner'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                  {auth?.user?.email || 'user@example.com'}
                </p>
              </div>
            </div>

            {/* User avatar only on mobile */}
            <div className="md:hidden flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {auth?.user?.name?.charAt(0)?.toUpperCase() || 'H'}
                </span>
              </div>
            </div>
            
            {/* Logout Button */}
            <div>
              <button 
                type='button' 
                onClick={confirmLogout}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 relative">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Confirm Logout
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to log out from the House Owner Portal?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}