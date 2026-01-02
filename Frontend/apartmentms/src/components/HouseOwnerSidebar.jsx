// // HouseOwnerSidebar.jsx
// import React, { useState, useContext } from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { 
//   LayoutDashboard, 
//   Home, 
//   Receipt, 
//   User, 
//   LogOut,
//   Menu,
//   X,
//   ChevronDown,
//   ChevronUp
// } from 'lucide-react';
// import { AuthContext } from '../contexts/AuthContext';

// export default function HouseOwnerSidebar({onCollapse }) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
//   const [expandedMenu, setExpandedMenu] = useState(null);
//   const { logout, auth } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const menuItems = [
//     {
//       title: 'Dashboard',
//       icon: <LayoutDashboard size={20} />,
//       path: '/houseowner/dashboard',
//       exact: true
//     },
//     {
//       title: 'My House',
//       icon: <Home size={20} />,
//       //path: '/houseowner/my-house',
//       exact: false
//     },
//     {
//       title: 'My Bills',
//       icon: <Receipt size={20} />,
//       //path: '/houseowner/my-bills',
//       exact: false,
//       subItems: [
//         {
//           title: 'Current Bills',
//           //path: '/houseowner/my-bills/current'
//         },
//         {
//           title: 'Payment History',
//           //path: '/houseowner/my-bills/history'
//         },
//         {
//           title: 'Pending Payments',
//           //path: '/houseowner/my-bills/pending'
//         }
//       ]
//     },
//     {
//       title: 'Profile',
//       icon: <User size={20} />,
//       //path: '/houseowner/profile',
//       exact: false,
//       subItems: [
//         {
//           title: 'Personal Info',
//         //   path: '/houseowner/profile/personal'
//         },
//         {
//           title: 'Documents',
//         //   path: '/houseowner/profile/documents'
//         },
//         {
//           title: 'Change Password',
//         //   path: '/houseowner/profile/change-password'
//         }
//       ]
//     }
//   ];

//   const toggleMenu = (title) => {
//     if (expandedMenu === title) {
//       setExpandedMenu(null);
//     } else {
//       setExpandedMenu(title);
//     }
//   };

//   const NavItem = ({ item }) => {
//     const isActive = item.exact 
//       ? location.pathname === item.path 
//       : location.pathname.startsWith(item.path);

//     return (
//       <div className="mb-1">
//         {item.subItems ? (
//           <>
//             <button
//               onClick={() => toggleMenu(item.title)}
//               className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
//                 isActive 
//                   ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
//                   : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 {item.icon}
//                 <span className="font-medium">{item.title}</span>
//               </div>
//               {expandedMenu === item.title ? (
//                 <ChevronUp size={16} />
//               ) : (
//                 <ChevronDown size={16} />
//               )}
//             </button>
            
//             {expandedMenu === item.title && (
//               <div className="ml-8 mt-1 space-y-1">
//                 {item.subItems.map((subItem, index) => (
//                   <NavLink
//                     key={index}
//                     to={subItem.path}
//                     className={({ isActive }) =>
//                       `block p-2 rounded-lg transition-colors ${
//                         isActive
//                           ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
//                           : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
//                       }`
//                     }
//                     onClick={() => setIsMobileSidebarOpen(false)}
//                   >
//                     <span className="text-sm">{subItem.title}</span>
//                   </NavLink>
//                 ))}
//               </div>
//             )}
//           </>
//         ) : (
//           <NavLink
//             to={item.path}
//             className={({ isActive }) =>
//               `flex items-center gap-3 p-3 rounded-lg transition-colors ${
//                 isActive
//                   ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
//                   : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
//               }`
//             }
//             onClick={() => setIsMobileSidebarOpen(false)}
//           >
//             {item.icon}
//             <span className="font-medium">{item.title}</span>
//           </NavLink>
//         )}
//       </div>
//     );
//   };

//   // Mobile toggle button
//   const MobileToggleButton = () => (
//     <button
//       onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
//       className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
//     >
//       {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
//     </button>
//   );

//   // Sidebar content
//   const SidebarContent = () => (
//     <div className="h-full flex flex-col">
//       {/* Logo Section */}
//       <div className="p-6 border-b dark:border-gray-700">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
//             <Home size={24} className="text-white" />
//           </div>
//           <div>
//             <h1 className="text-lg font-bold text-gray-800 dark:text-white">
//               AptSync
//             </h1>
//             <p className="text-xs text-gray-500 dark:text-gray-400">
//               House Owner Portal
//             </p>
//           </div>
//         </div>
//       </div>


//       {/* Navigation Menu */}
//       <nav className="flex-1 p-4 overflow-y-auto">
//         <div className="space-y-1">
//           {menuItems.map((item, index) => (
//             <NavItem key={index} item={item} />
//           ))}
//         </div>
//       </nav>

//     </div>
//   );

//   return (
//     <>
//       {/* Mobile Toggle Button */}
//       <MobileToggleButton />

//       {/* Mobile Overlay */}
//       {isMobileSidebarOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
//           onClick={() => setIsMobileSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar - Mobile */}
//       <aside
//         className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-40 transform transition-transform duration-300 ${
//           isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//       >
//         <SidebarContent />
//       </aside>

//       {/* Sidebar - Desktop */}
//       <aside
//         className={`hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 transition-all duration-300 ${
//           isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//       >
//         <SidebarContent />
        
//         {/* Desktop Toggle Button */}
//         <button
//             onClick={() => {
//             setIsSidebarOpen(!isSidebarOpen);
//             if (onCollapse) onCollapse(!isSidebarOpen);
//             }}
//             className="absolute -right-3 top-6 p-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full shadow-lg"
//         >
//             {isSidebarOpen ? (
//             <ChevronDown className="transform -rotate-90" size={16} />
//             ) : (
//             <ChevronDown className="transform rotate-90" size={16} />
//             )}
//         </button>
//       </aside>
//     </>
//   );
// };

// components/HouseOwnerSidebar.jsx
import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Receipt, 
  User,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function HouseOwnerSidebar({ onCollapse }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/houseowner/dashboard',
      exact: true
    },
    {
      title: 'My House',
      icon: <Home size={20} />,
      path: '/houseowner/houseowner-houseview',
      exact: false
    },
    {
      title: 'My Bills',
      icon: <Receipt size={20} />,
      path: '/houseowner/my-bills',
      exact: false,
      subItems: [
        {
          title: 'Current Bills',
          path: '/houseowner/my-bills/current'
        },
        {
          title: 'Payment History',
          path: '/houseowner/my-bills/history'
        },
        {
          title: 'Pending Payments',
          path: '/houseowner/my-bills/pending'
        }
      ]
    },
    {
      title: 'Profile',
      icon: <User size={20} />,
      path: '/houseowner/profile',
      exact: false,
      subItems: [
        {
          title: 'Personal Info',
          path: '/houseowner/profile/personal'
        },
        {
          title: 'Documents',
          path: '/houseowner/profile/documents'
        },
        {
          title: 'Change Password',
          path: '/houseowner/profile/change-password'
        }
      ]
    }
  ];

  const toggleMenu = (title) => {
    if (expandedMenu === title) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(title);
    }
  };

  const NavItem = ({ item }) => {
    const isActive = item.exact 
      ? location.pathname === item.path 
      : location.pathname.startsWith(item.path);

    return (
      <div className="mb-1">
        {item.subItems ? (
          <>
            <button
              onClick={() => toggleMenu(item.title)}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </div>
              {expandedMenu === item.title ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            
            {expandedMenu === item.title && (
              <div className="ml-8 mt-1 space-y-1">
                {item.subItems.map((subItem, index) => (
                  <NavLink
                    key={index}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `block p-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`
                    }
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <span className="text-sm">{subItem.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </>
        ) : (
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`
            }
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            {item.icon}
            <span className="font-medium">{item.title}</span>
          </NavLink>
        )}
      </div>
    );
  };

  const MobileToggleButton = () => (
    <button
      onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Home size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              AptSync
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              House Owner Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <MobileToggleButton />

      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-40 transform transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      <aside
        className={`hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 transition-all duration-300 fixed left-0 top-0 h-full z-30 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
        
        <button
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
            if (onCollapse) onCollapse(!isSidebarOpen);
          }}
          className="absolute -right-3 top-6 p-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full shadow-lg"
        >
          {isSidebarOpen ? (
            <ChevronDown className="transform -rotate-90" size={16} />
          ) : (
            <ChevronDown className="transform rotate-90" size={16} />
          )}
        </button>
      </aside>
    </>
  );
};
