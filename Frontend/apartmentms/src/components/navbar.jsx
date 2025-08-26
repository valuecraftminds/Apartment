// components/Navbar.jsx
import React, { useState, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { Menu, X, Bell, Search, LogOut } from 'lucide-react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { auth, setAuth } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // Call your logout API endpoint
      await api.post('/auth/logout')
      // Clear auth context
      setAuth(null)
      // Show success message
      toast.success('Logged out successfully')
      // Redirect to login page
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if API call fails, clear local auth state
      setAuth(null)
      toast.success('Logged out successfully')
      navigate('/login')
    }
  }

  const confirmLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      handleLogout()
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Mobile menu button and search */}
          <div className="flex items-center">
            {/* Mobile menu button - hidden on desktop */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Search bar */}
            <div className="hidden md:block relative ml-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm w-64"
              />
            </div>
          </div>

          {/* Right side - Notifications and user info */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-600 hover:text-purple-600 hover:bg-gray-100 transition-colors duration-200 relative">
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
                <p className="text-sm font-medium text-gray-800">
                  {auth?.user?.name || auth?.user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {auth?.user?.role}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <div>
              <button 
                type='button' 
                onClick={confirmLogout}
                className="p-2 rounded-md bg-green-500 text-gray-600 hover:text-red-600 hover:bg-gray-100 transition-colors duration-200"
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
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile search */}
            <div className="px-3 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>
            </div>
            
            {/* Mobile logout button */}
            <div className="px-3 py-2 border-t border-gray-200">
              <button 
                onClick={confirmLogout}
                className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md bg-transparent"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}