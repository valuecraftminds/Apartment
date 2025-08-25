import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BarChart3,
  Users,
  Building,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', path: '/admindashboard', icon: Home },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Properties', path: '/properties', icon: Building },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 fixed left-0 top-0 h-full z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Company Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center">
            <img
              className="h-8 w-8"
              src="/favicon.ico"
              alt="AptSync Logo"
            />
            <span className="ml-2 text-xl font-bold text-gray-800">
              AptSync Admin
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
          className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
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
                  ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} className={isCollapsed ? '' : 'mr-3'} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapsed Tooltips */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 top-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="relative group"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-2 top-1/2 transform -translate-y-1/2">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {item.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}