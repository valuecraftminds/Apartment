// // components/Sidebar.jsx
// import React, { useState, useContext, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import {
//   Home,
//   Users,
//   Building2,
//   FileText,
//   Settings,
//   ChevronLeft,
//   ChevronRight,
//   BanknoteArrowDown,
//   ChevronDown,
//   ChevronUp,
//   Wrench,
//   ClipboardList,
//   CreditCard,
//   BarChart3,
//   UserCog,
//   Shield,
//   RefreshCw,
//   Menu,
//   X
// } from 'lucide-react';
// import { AuthContext } from '../contexts/AuthContext';
// import api from '../api/axios';

// export default function Sidebar() {
//   const { auth } = useContext(AuthContext);
//   const location = useLocation();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [assignedComponents, setAssignedComponents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [lastRefresh, setLastRefresh] = useState(Date.now());
//   const [isMobileOpen, setIsMobileOpen] = useState(false);


//   const userRole = auth?.user?.role || 'Admin';
//   const userId = auth?.user?.id;

//   // Constant components for all roles
//   const CONSTANT_COMPONENTS = ['employee_dashboard', 'profile'];

//   // All possible components with consistent structure
//   const allComponents = {
//     employee_dashboard: { 
//       id: 'employee_dashboard', 
//       name: 'Dashboard', 
//       path: '/employee-dashboard', 
//       icon: Home, 
//       isConstant: true 
//     },
//     profile: { 
//       id: 'profile', 
//       name: 'Profile', 
//       path: `/profile-page`, 
//       icon: Settings, 
//       isConstant: true 
//     },

//     // Admin components
//     admin_dashboard: { 
//       id: 'admin_dashboard', 
//       name: 'Dashboard', 
//       path: '/admindashboard', 
//       icon: Home, 
//       isConstant: true 
//     },
//     admin_profile: { 
//       id: 'admin_profile', 
//       name: 'Profile', 
//       path: '/profile-page', 
//       icon: Settings, 
//       isConstant: true 
//     },

//     // Management components
//     users_management: { 
//       id: 'users_management', 
//       name: 'Users', 
//       path: '/userview', 
//       icon: Users, 
//       isConstant: false 
//     },
//     role_management: { 
//       id: 'role_management', 
//       name: 'Roles', 
//       path: '/role', 
//       icon: UserCog, 
//       isConstant: false 
//     },
//     apartments_management: { 
//       id: 'apartments_management', 
//       name: 'Apartments', 
//       path: '/apartmentview', 
//       icon: Building2, 
//       isConstant: false 
//     },
//     expenses_management: { 
//       id: 'expenses_management', 
//       name: 'Expenses', 
//       icon: BanknoteArrowDown, 
//       isConstant: false, 
//       children: [
//         { name: 'Bills', path: '/bills-and-calculations' },
//         { name: 'Bill Payments', path:'/bill-payments'}
//       ] 
//     },
//     tenant_management: { 
//       id: 'tenant_management', 
//       name: 'Tenants', 
//       path: '/manager-tenants', 
//       icon: Users, 
//       isConstant: false 
//     },
//     my_apartments: { 
//       id: 'my_apartments', 
//       name: 'My Apartments', 
//       path: '/my-apartments', 
//       icon: Building2, 
//       isConstant: false 
//     },
//     bill_management: {
//       id: 'bill_management',
//       name: 'Measurable Bills',
//       path: '/measurable-bills',
//       icon: CreditCard,
//       isConstant: false
//     }
//   };

//   // Admin default nav items
//   const getAdminNavigationItems = () => [
//     'admin_dashboard',
//     'users_management', 
//     'role_management',
//     'apartments_management',
//     'expenses_management',
//     'admin_profile'
//   ];

//   // Fetch assigned components for logged-in user
//   const fetchUserComponents = async () => {
//     try {
//       setLoading(true);
//       console.log('Fetching components for role:', userRole);
      
//       if (userRole === 'Admin') {
//         // For Admin, use predefined admin components
//         setAssignedComponents(getAdminNavigationItems());
//         setLoading(false);
//         return;
//       }

//       // For non-admin roles, always fetch fresh from API
//       try {
//         const response = await api.get('/role-components/user/components');
//         console.log('API Response:', response.data);
        
//         if (response.data.success) {
//           const apiComponents = response.data.data || [];
//           console.log('Components from API:', apiComponents);
          
//           // Filter out constant components that might come from API to avoid duplicates
//           const customComponents = apiComponents.filter(comp => 
//             !CONSTANT_COMPONENTS.includes(comp)
//           );
          
//           const finalComponents = [...CONSTANT_COMPONENTS, ...customComponents];
//           console.log('Final components to set:', finalComponents);
//           setAssignedComponents(finalComponents);
//         } else {
//           console.error('API returned error:', response.data.message);
//           setAssignedComponents([...CONSTANT_COMPONENTS]);
//         }
//       } catch (err) {
//         console.error('Error fetching user components', err);
//         setAssignedComponents([...CONSTANT_COMPONENTS]);
//       }
//     } catch (error) {
//       console.error('Error in fetchUserComponents', error);
//       if (userRole === 'Admin') {
//         setAssignedComponents(getAdminNavigationItems());
//       } else {
//         setAssignedComponents([...CONSTANT_COMPONENTS]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserComponents();
//   }, [userRole, userId, lastRefresh]); // Added lastRefresh dependency

//    // Close mobile sidebar when route changes
//   useEffect(() => {
//     setIsMobileOpen(false);
//   }, [location.pathname]);

//   // Refresh components manually
//   const refreshComponents = () => {
//     setLastRefresh(Date.now());
//   };

//   // Build nav items for sidebar - convert component IDs to actual nav objects
//   const getNavigationItems = () => {
//     const items = assignedComponents
//       .map(componentId => allComponents[componentId])
//       .filter(Boolean); // Remove any undefined components
    
//     console.log('Built navigation items:', items);
//     return items;
//   };

//   const navigationItems = getNavigationItems();

//   const isActive = (path) => location.pathname === path;

//   const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);

//   const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  

//   // Mobile sidebar content (separate from desktop to avoid conflicts)
//   const MobileSidebarContent = () => (
//     <div className="bg-white dark:bg-gray-800 h-full w-64 shadow-lg border-r border-gray-200 dark:border-gray-700">
//       {/* Mobile Sidebar Header */}
//       <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 pt-16">
//         <div className="flex items-center justify-between w-full">
//           <span className="text-xl font-bold text-gray-800 dark:text-gray-300">
//             AptSync
//           </span>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={refreshComponents}
//               className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-600 dark:text-gray-400"
//               title="Refresh components"
//             >
//               <RefreshCw size={16} />
//             </button>
//             <button
//               onClick={toggleMobileSidebar}
//               className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-purple-700 dark:text-purple-400"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Navigation */}
//       <nav className="p-4 space-y-1">
//         {loading ? (
//           <div className="flex justify-center items-center py-4">
//             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
//             <span className="ml-2 text-sm text-gray-600">Loading...</span>
//           </div>
//         ) : navigationItems.length === 0 ? (
//           <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
//             No components assigned
//           </div>
//         ) : (
//           navigationItems.map(item => {
//             if (!item) return null;
            
//             const Icon = item.icon;
            
//             if (item.children) {
//               const isDropdownActive = item.children.some(child => 
//                 child.path && isActive(child.path)
//               );
              
//               return (
//                 <div key={item.id}>
//                   <button
//                     onClick={() => toggleDropdown(item.name)}
//                     className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
//                       openDropdown === item.name || isDropdownActive
//                         ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
//                         : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
//                     }`}
//                   >
//                     <div className="flex items-center">
//                       <Icon size={20} className="mr-3" />
//                       <span>{item.name}</span>
//                     </div>
//                     {item.children && item.children.length > 0 && 
//                       (openDropdown === item.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />)
//                     }
//                   </button>

//                   {openDropdown === item.name && item.children && (
//                     <div className="ml-8 mt-1 space-y-1">
//                       {item.children.map(child => (
//                         <Link
//                           key={child.name}
//                           to={child.path}
//                           className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
//                             isActive(child.path)
//                               ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
//                               : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
//                           }`}
//                         >
//                           {child.name}
//                         </Link>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               );
//             }

//             return (
//               <Link
//                 key={item.id}
//                 to={item.path}
//                 className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
//                   isActive(item.path)
//                     ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
//                     : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
//                 }`}
//               >
//                 <Icon size={20} className="mr-3" />
//                 <span>{item.name}</span>
//               </Link>
//             );
//           })
//         )}
//       </nav>
//     </div>
//   );

//   return (
//     <>
//       {/* Mobile Menu Button - Only visible on mobile */}
//       <div className="lg:hidden fixed top-4 left-4 z-50">
//         <button
//           onClick={toggleMobileSidebar}
//           className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-purple-700 dark:text-purple-400"
//         >
//           <Menu size={24} />
//         </button>
//       </div>

//       {/* Mobile Sidebar Overlay */}
//       {isMobileOpen && (
//         <div 
//           className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
//           onClick={() => setIsMobileOpen(false)}
//         />
//       )}

//         {/* Mobile Sidebar */}
//         <div className={`
//           lg:hidden fixed left-0 top-0 h-full z-50
//           transform transition-transform duration-300 ease-in-out
//           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
//         `}>
//           <MobileSidebarContent />
//         </div>


//     <div className={`bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 h-full z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
//       {/* Sidebar Header */}
//       <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
//         {!isCollapsed && (
//           <div className="flex items-center justify-between w-full">
//             <span className="text-xl font-bold text-gray-800 dark:text-gray-300">
//               AptSync
//             </span>
//             <button
//               onClick={refreshComponents}
//               className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-600 dark:text-gray-400"
//               title="Refresh components"
//             >
//               <RefreshCw size={16} />
//             </button>
//           </div>
//         )}
//         {isCollapsed && (
//           <div className="flex justify-center w-full">
//             <img className="h-8 w-8" src="/favicon.ico" alt="Logo" />
//           </div>
//         )}
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-purple-700 dark:text-purple-400"
//         >
//           {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//         </button>
//       </div>

//       {/* Navigation */}
//       <nav className="p-4 space-y-1">
//         {loading ? (
//           <div className="flex justify-center items-center py-4">
//             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
//             {!isCollapsed && <span className="ml-2 text-sm text-gray-600">Loading...</span>}
//           </div>
//         ) : navigationItems.length === 0 ? (
//           <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
//             No components assigned
//           </div>
//         ) : (
//           navigationItems.map(item => {
//             if (!item) return null;
            
//             const Icon = item.icon;
            
//             if (item.children) {
//               const isDropdownActive = item.children.some(child => 
//                 child.path && isActive(child.path)
//               );
              
//               return (
//                 <div key={item.id}>
//                   <button
//                     onClick={() => toggleDropdown(item.name)}
//                     className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
//                       openDropdown === item.name || isDropdownActive
//                         ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
//                         : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
//                     }`}
//                   >
//                     <div className="flex items-center">
//                       <Icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
//                       {!isCollapsed && <span>{item.name}</span>}
//                     </div>
//                     {!isCollapsed && item.children && item.children.length > 0 && 
//                       (openDropdown === item.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />)
//                     }
//                   </button>

//                   {openDropdown === item.name && !isCollapsed && item.children && (
//                     <div className="ml-8 mt-1 space-y-1">
//                       {item.children.map(child => (
//                         <Link
//                           key={child.name}
//                           to={child.path}
//                           className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
//                             isActive(child.path)
//                               ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
//                               : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
//                           }`}
//                         >
//                           {child.name}
//                         </Link>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               );
//             }

//             return (
//               <Link
//                 key={item.id}
//                 to={item.path}
//                 className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
//                   isActive(item.path)
//                     ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
//                     : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
//                 }`}
//               >
//                 <Icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
//                 {!isCollapsed && <span>{item.name}</span>}
//               </Link>
//             );
//           })
//         )}
//       </nav>
//     </div>
//      <div className="lg:hidden h-16" />
//     </>
//   );
// }

// components/Sidebar.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Building2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  BanknoteArrowDown,
  ChevronDown,
  ChevronUp,
  Wrench,
  ClipboardList,
  CreditCard,
  BarChart3,
  UserCog,
  Shield,
  RefreshCw,
  Menu,
  X
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios';

export default function Sidebar() {
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [assignedComponents, setAssignedComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const userRole = auth?.user?.role || 'Admin';
  const userId = auth?.user?.id;

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Constant components for all roles
  const CONSTANT_COMPONENTS = ['employee_dashboard', 'profile'];

  // All possible components with consistent structure
  const allComponents = {
    employee_dashboard: { 
      id: 'employee_dashboard', 
      name: 'Dashboard', 
      path: '/employee-dashboard', 
      icon: Home, 
      isConstant: true 
    },
    profile: { 
      id: 'profile', 
      name: 'Profile', 
      path: `/profile-page`, 
      icon: Settings, 
      isConstant: true 
    },

    // Admin components
    admin_dashboard: { 
      id: 'admin_dashboard', 
      name: 'Dashboard', 
      path: '/admindashboard', 
      icon: Home, 
      isConstant: true 
    },
    admin_profile: { 
      id: 'admin_profile', 
      name: 'Profile', 
      path: '/profile-page', 
      icon: Settings, 
      isConstant: true 
    },

    // Management components
    users_management: { 
      id: 'users_management', 
      name: 'Users', 
      path: '/userview', 
      icon: Users, 
      isConstant: false 
    },
    role_management: { 
      id: 'role_management', 
      name: 'Roles', 
      path: '/role', 
      icon: UserCog, 
      isConstant: false 
    },
    apartments_management: { 
      id: 'apartments_management', 
      name: 'Apartments', 
      path: '/apartmentview', 
      icon: Building2, 
      isConstant: false 
    },
    expenses_management: { 
      id: 'expenses_management', 
      name: 'Expenses', 
      icon: BanknoteArrowDown, 
      isConstant: false, 
      children: [
        { name: 'Bills', path: '/bills-and-calculations' },
        { name: 'Bill Payments', path: '/bill-payments' }
      ] 
    },
    tenant_management: { 
      id: 'tenant_management', 
      name: 'Tenants', 
      path: '/manager-tenants', 
      icon: Users, 
      isConstant: false 
    },
    my_apartments: { 
      id: 'my_apartments', 
      name: 'My Apartments', 
      path: '/my-apartments', 
      icon: Building2, 
      isConstant: false 
    },
    bill_management: {
      id: 'bill_management',
      name: 'Measurable Bills',
      path: '/measurable-bills',
      icon: CreditCard,
      isConstant: false
    }
  };

  // Admin default nav items
  const getAdminNavigationItems = () => [
    'admin_dashboard',
    'users_management', 
    'role_management',
    'apartments_management',
    'expenses_management',
    'admin_profile'
  ];

  // Fetch assigned components for logged-in user
  const fetchUserComponents = async () => {
    try {
      setLoading(true);
      console.log('Fetching components for role:', userRole);
      
      if (userRole === 'Admin') {
        // For Admin, use predefined admin components
        setAssignedComponents(getAdminNavigationItems());
        setLoading(false);
        return;
      }

      // For non-admin roles, always fetch fresh from API
      try {
        const response = await api.get('/role-components/user/components');
        console.log('API Response:', response.data);
        
        if (response.data.success) {
          const apiComponents = response.data.data || [];
          console.log('Components from API:', apiComponents);
          
          // Filter out constant components that might come from API to avoid duplicates
          const customComponents = apiComponents.filter(comp => 
            !CONSTANT_COMPONENTS.includes(comp)
          );
          
          const finalComponents = [...CONSTANT_COMPONENTS, ...customComponents];
          console.log('Final components to set:', finalComponents);
          setAssignedComponents(finalComponents);
        } else {
          console.error('API returned error:', response.data.message);
          setAssignedComponents([...CONSTANT_COMPONENTS]);
        }
      } catch (err) {
        console.error('Error fetching user components', err);
        setAssignedComponents([...CONSTANT_COMPONENTS]);
      }
    } catch (error) {
      console.error('Error in fetchUserComponents', error);
      if (userRole === 'Admin') {
        setAssignedComponents(getAdminNavigationItems());
      } else {
        setAssignedComponents([...CONSTANT_COMPONENTS]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserComponents();
  }, [userRole, userId, lastRefresh]);

  // Refresh components manually
  const refreshComponents = () => {
    setLastRefresh(Date.now());
  };

  // Build nav items for sidebar - convert component IDs to actual nav objects
  const getNavigationItems = () => {
    const items = assignedComponents
      .map(componentId => allComponents[componentId])
      .filter(Boolean); // Remove any undefined components
    
    console.log('Built navigation items:', items);
    return items;
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => location.pathname === path;

  const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Don't allow collapsing on mobile - use menu instead
  const handleCollapseToggle = () => {
    if (isMobile) {
      toggleMobileMenu();
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Mobile hamburger button component
  const MobileMenuButton = () => (
    <button
      onClick={toggleMobileMenu}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-purple-700 dark:text-purple-400"
    >
      {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  // Desktop Sidebar Content
  const DesktopSidebarContent = () => (
    <div className={`hidden lg:flex flex-col h-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center justify-between w-full">
            <span className="text-xl font-bold text-gray-800 dark:text-gray-300">
              AptSync
            </span>
            <button
              onClick={refreshComponents}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-600 dark:text-gray-400"
              title="Refresh components"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center w-full">
            <img className="h-8 w-8" src="/favicon.ico" alt="Logo" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-purple-700 dark:text-purple-400"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            {!isCollapsed && <span className="ml-2 text-sm text-gray-600">Loading...</span>}
          </div>
        ) : navigationItems.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            No components assigned
          </div>
        ) : (
          navigationItems.map(item => {
            if (!item) return null;
            
            const Icon = item.icon;
            
            if (item.children) {
              const isDropdownActive = item.children.some(child => 
                child.path && isActive(child.path)
              );
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                      openDropdown === item.name || isDropdownActive
                        ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && item.children && item.children.length > 0 && 
                      (openDropdown === item.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />)
                    }
                  </button>

                  {openDropdown === item.name && !isCollapsed && item.children && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map(child => (
                        <Link
                          key={child.name}
                          to={child.path}
                          className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                            isActive(child.path)
                              ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
                              : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
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

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
                }`}
              >
                <Icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })
        )}
      </nav>
    </div>
  );

  // Mobile Sidebar Content (always expanded when open)
  const MobileSidebarContent = () => (
    <div className="lg:hidden fixed left-0 top-0 h-full w-64 z-50 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out"
         style={{ transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
      
      {/* Mobile Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 pt-16">
        <div className="flex items-center justify-between w-full">
          <span className="text-xl font-bold text-gray-800 dark:text-gray-300">
            AptSync
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshComponents}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-600 dark:text-gray-400"
              title="Refresh components"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={toggleMobileMenu}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-purple-700 dark:text-purple-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="p-4 space-y-1">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading...</span>
          </div>
        ) : navigationItems.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            No components assigned
          </div>
        ) : (
          navigationItems.map(item => {
            if (!item) return null;
            
            const Icon = item.icon;
            
            if (item.children) {
              const isDropdownActive = item.children.some(child => 
                child.path && isActive(child.path)
              );
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                      openDropdown === item.name || isDropdownActive
                        ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon size={20} className="mr-3" />
                      <span>{item.name}</span>
                    </div>
                    {item.children && item.children.length > 0 && 
                      (openDropdown === item.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />)
                    }
                  </button>

                  {openDropdown === item.name && item.children && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map(child => (
                        <Link
                          key={child.name}
                          to={child.path}
                          className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                            isActive(child.path)
                              ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
                              : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
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

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-purple-300'
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span>{item.name}</span>
              </Link>
            );
          })
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileMenuButton />

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <MobileSidebarContent />

      {/* Desktop Sidebar */}
      <DesktopSidebarContent />

      {/* Spacer for mobile - to prevent content from being hidden behind fixed header */}
      <div className="lg:hidden h-16" />
    </>
  );
}
