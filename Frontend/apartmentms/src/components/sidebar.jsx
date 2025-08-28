import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Building,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', path: '/admindashboard', icon: Home},
    { name: 'Users', path: '/userview', icon: Users },
    { name: 'Apartments', path: '/apartmentview', icon: Building2 },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 h-full z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Company Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:text-white">
        {!isCollapsed && (
          <div className="flex items-center">
            <img
              className="h-8 w-8"
              src="/favicon.ico"
              alt="AptSync Logo"
            />
            <span className="ml-2 text-xl font-bold text-gray-800 dark:text-gray-300">
              AptSync
            </span>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center w-full">
            <img
              className="h-8 w-8"
              src="/favicon.ico"
              alt="AptSync Logo"
            />
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100'
              }`}
            >
              <Icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}