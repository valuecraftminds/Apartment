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
  Building2,
  BanknoteArrowDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', path: '/admindashboard', icon: Home },
    { name: 'Users', path: '/userview', icon: Users },
    { name: 'Apartments', path: '/apartmentview', icon: Building2 },
    { 
      name: 'Expenses', 
      icon: BanknoteArrowDown, 
      children: [
        { name: 'Bills', path: '/bills' },
        { name: 'Office Use', path: '/officeuse' }
      ]
    },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 h-full z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Company Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:text-white">
        {!isCollapsed && (
          <div className="flex items-center">
            <span className="ml-2 text-xl font-bold text-gray-800 dark:text-gray-300">
              AptSync
            </span>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center w-full">
            <img className="h-8 w-8" src="/favicon.ico" alt="AptSync Logo" />
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

          // If item has children → Dropdown
          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                    openDropdown === item.name
                      ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed &&
                    (openDropdown === item.name ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>

                {/* Dropdown Items */}
                {openDropdown === item.name && !isCollapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.path}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                          isActive(child.path)
                            ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600'
                            : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100'
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Normal Item
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
