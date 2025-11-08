// import React, { useState } from 'react'
// import { Link, useLocation } from 'react-router-dom';
// import {
//   Home,
//   Users,
//   Building,
//   FileText,
//   Settings,
//   ChevronLeft,
//   ChevronRight,
//   Building2,
//   BanknoteArrowDown,
//   ChevronDown,
//   ChevronUp
// } from 'lucide-react';

// export default function Sidebar() {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
//   const location = useLocation();

//   const navigationItems = [
//     { name: 'Dashboard', path: '/admindashboard', icon: Home },
//     { name: 'Users', path: '/userview', icon: Users },
//     { name: 'Apartments', path: '/apartmentview', icon: Building2 },
//     { 
//       name: 'Expenses', 
//       icon: BanknoteArrowDown, 
//       children: [
//         { name: 'Bills', path: '/bills-and-calculations' },
//       ]
//     },
//     { name: 'Settings', path: '/settings', icon: Settings }
//   ];

//   const isActive = (path) => location.pathname === path;

//   const toggleDropdown = (name) => {
//     setOpenDropdown(openDropdown === name ? null : name);
//   };

//   return (
//     <div className={`bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 h-full z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
//       {/* Company Header */}
//       <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:text-white">
//         {!isCollapsed && (
//           <div className="flex items-center">
//             <span className="ml-2 text-xl font-bold text-gray-800 dark:text-gray-300">
//               AptSync
//             </span>
//           </div>
//         )}
        
//         {isCollapsed && (
//           <div className="flex justify-center w-full">
//             <img className="h-8 w-8" src="/favicon.ico" alt="AptSync Logo" />
//           </div>
//         )}
        
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700"
//         >
//           {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//         </button>
//       </div>

//       {/* Navigation Items */}
//       <nav className="p-4 space-y-1">
//         {navigationItems.map((item) => {
//           const Icon = item.icon;

//           // If item has children → Dropdown
//           if (item.children) {
//             return (
//               <div key={item.name}>
//                 <button
//                   onClick={() => toggleDropdown(item.name)}
//                   className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
//                     openDropdown === item.name
//                       ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600'
//                       : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100'
//                   }`}
//                 >
//                   <div className="flex items-center">
//                     <Icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
//                     {!isCollapsed && <span>{item.name}</span>}
//                   </div>
//                   {!isCollapsed &&
//                     (openDropdown === item.name ? (
//                       <ChevronUp size={16} />
//                     ) : (
//                       <ChevronDown size={16} />
//                     ))}
//                 </button>

//                 {/* Dropdown Items */}
//                 {openDropdown === item.name && !isCollapsed && (
//                   <div className="ml-8 mt-1 space-y-1">
//                     {item.children.map((child) => (
//                       <Link
//                         key={child.name}
//                         to={child.path}
//                         className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
//                           isActive(child.path)
//                             ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600'
//                             : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100'
//                         }`}
//                       >
//                         {child.name}
//                       </Link>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             );
//           }

//           // Normal Item
//           return (
//             <Link
//               key={item.name}
//               to={item.path}
//               className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
//                 isActive(item.path)
//                   ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600'
//                   : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100'
//               }`}
//             >
//               <Icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
//               {!isCollapsed && <span>{item.name}</span>}
//             </Link>
//           );
//         })}
//       </nav>
//     </div>
//   );
// }

import React, { useState, useContext } from 'react'
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
  ChevronUp,
  Wrench,
  ClipboardList,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const { auth } = useContext(AuthContext);

  // Get user role from auth context
  const userRole = auth?.user?.role || 'Admin'; // Default to Admin if not available

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = {
      // Admin - Full access
      Admin: [
        { name: 'Dashboard', path: '/admindashboard', icon: Home, roles: ['Admin'] },
        { name: 'Users', path: '/userview', icon: Users, roles: ['Admin'] },
        { name: 'Apartments', path: '/apartmentview', icon: Building2, roles: ['Admin'] },
        { 
          name: 'Expenses', 
          icon: BanknoteArrowDown, 
          roles: ['Admin'],
          children: [
            { name: 'Bills', path: '/bills-and-calculations', roles: ['Admin'] },
          ]
        },
        // { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['Admin'] },
        { name: 'Profile', path: '/admin-profile', icon: Settings, roles: ['Admin'] }
      ],
      
      // Apartment Owner - Limited access
      Apartment_owner: [
        { name: 'Dashboard', path: '/owner-dashboard', icon: Home, roles: ['Apartment_owner'] },
        { name: 'My Apartments', path: '/owner-apartments', icon: Building2, roles: ['Apartment_owner'] },
        { 
          name: 'Expenses', 
          icon: BanknoteArrowDown, 
          roles: ['Apartment_owner'],
          children: [
            { name: 'My Bills', path: '/owner-bills', roles: ['Apartment_owner'] },
            { name: 'Payment History', path: '/payment-history', roles: ['Apartment_owner'] },
          ]
        },
        { name: 'Profile', path: '/owner-profile', icon: Settings, roles: ['Apartment_owner'] }
      ],
      
      // Apartment Manager - Management access
      Apartment_manager: [
        { name: 'Dashboard', path: '/manager-dashboard', icon: Home, roles: ['Apartment_manager'] },
        { name: 'Tenants', path: '/manager-tenants', icon: Users, roles: ['Apartment_manager'] },
        { name: 'Apartments', path: '/manager-apartments', icon: Building2, roles: ['Apartment_manager'] },
        { 
          name: 'Expenses', 
          icon: BanknoteArrowDown, 
          roles: ['Apartment_manager'],
          children: [
            { name: 'Bills', path: '/manager-bills', roles: ['Apartment_manager'] },
            { name: 'Collections', path: '/collections', roles: ['Apartment_manager'] },
          ]
        },
        { name: 'Maintenance', path: '/maintenance-requests', icon: Wrench, roles: ['Apartment_manager'] },
        { name: 'Reports', path: '/manager-reports', icon: BarChart3, roles: ['Apartment_manager'] },
        { name: 'Profile', path: '/manager-profile', icon: Settings, roles: ['Apartment_manager'] }
      ],
      
      // Apartment Technician - Technical access
      Apartment_technician: [
        { name: 'Dashboard', path: '/technician-dashboard', icon: Home, roles: ['Apartment_technician'] },
        { name: 'Maintenance Tasks', path: '/maintenance-tasks', icon: Wrench, roles: ['Apartment_technician'] },
        { name: 'Work Orders', path: '/work-orders', icon: ClipboardList, roles: ['Apartment_technician'] },
        { name: 'Inventory', path: '/inventory', icon: FileText, roles: ['Apartment_technician'] },
        { name: 'Profile', path: '/technician-profile', icon: Settings, roles: ['Apartment_technician'] }
      ]
    };

    return baseItems[userRole] || baseItems['Admin']; // Fallback to Admin
  };

  const navigationItems = getNavigationItems();

  // Helper function to check if user has access to an item
  const hasAccess = (item) => {
    return item.roles.includes(userRole);
  };

  const isActive = (path) => location.pathname === path;

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Get sidebar title based on role
  const getSidebarTitle = () => {
    const titles = {
      'Admin': 'AptSync Admin',
      'Apartment_owner': 'AptSync Owner',
      'Apartment_manager': 'AptSync Manager', 
      'Apartment_technician': 'AptSync Technician'
    };
    return titles[userRole] || 'AptSync';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 h-full z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Company Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:text-white">
        {!isCollapsed && (
          <div className="flex items-center">
            <span className="ml-2 text-xl font-bold text-gray-800 dark:text-gray-300">
              {getSidebarTitle()}
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
          // Skip rendering if user doesn't have access
          if (!hasAccess(item)) return null;

          const Icon = item.icon;

          // If item has children → Dropdown
          if (item.children) {
            // Filter children based on role access
            const accessibleChildren = item.children.filter(child => hasAccess(child));
            
            // Don't render dropdown if no children are accessible
            if (accessibleChildren.length === 0) return null;

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
                  {!isCollapsed && accessibleChildren.length > 0 &&
                    (openDropdown === item.name ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>

                {/* Dropdown Items */}
                {openDropdown === item.name && !isCollapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {accessibleChildren.map((child) => (
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

      {/* User Role Badge (optional) */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-300">Logged in as</p>
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 capitalize">
              {userRole.replace('_', ' ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
