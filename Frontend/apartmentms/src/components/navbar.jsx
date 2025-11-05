// components/Navbar.jsx
import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { Menu, X, Bell, Search, LogOut, Moon, Sun } from 'lucide-react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { auth, setAuth } = useContext(AuthContext)
  const navigate = useNavigate()
  const [showlogoutModel,setShowLogoutModel] = useState(false);

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

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      setAuth(null)
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setAuth(null)
      toast.success('Logged out successfully')
      navigate('/login')
    }
  }

  const confirmLogout = () => {
    // if (window.confirm('Are you sure you want to logout?')) {
    //   handleLogout()
    // }
    setShowLogoutModel(true);
  }

  const cancelLogout = () => {
  setShowLogoutModel(false);
};

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Mobile menu button and search */}
          <div className="flex items-center">
            {/* Mobile menu button - hidden on desktop */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Search bar */}
            <div className="hidden md:block relative ml-4">
              {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-800 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-gray-800 text-sm w-64 transition-colors duration-200"
              /> */}
            </div>
          </div>

          {/* Right side - Notifications and user info */}
          <div className="flex items-center space-x-4">
            {/* Dark/Light mode toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative"
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

            {/* User info */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {auth?.user?.name?.[0] || auth?.user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {auth?.user?.name || auth?.user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {auth?.user?.role}
                </p>
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

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile search */}
            <div className="px-3 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-sm transition-colors duration-200"
                />
              </div>
            </div>
            
            {/* Dark mode toggle for mobile */}
            <div className="px-3 py-2">
              <button 
                onClick={toggleDarkMode}
                className="flex items-center w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                {isDarkMode ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
            
            {/* Mobile logout button */}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={confirmLogout}
                className="flex items-center w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showlogoutModel && (
        <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Confirm Logout
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to log out?
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