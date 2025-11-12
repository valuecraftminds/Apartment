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
  RefreshCw
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

  const userRole = auth?.user?.role || 'Admin';
  const userId = auth?.user?.id;

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
      path: `/profile/${userId}`, 
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
      path: '/admin-profile', 
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
      children: [{ name: 'Bills', path: '/bills-and-calculations' }] 
    },
    reports_analytics: { 
      id: 'reports_analytics', 
      name: 'Reports', 
      path: '/reports', 
      icon: BarChart3, 
      isConstant: false 
    },
    tenant_management: { 
      id: 'tenant_management', 
      name: 'Tenants', 
      path: '/manager-tenants', 
      icon: Users, 
      isConstant: false 
    },
    property_management: { 
      id: 'property_management', 
      name: 'Properties', 
      path: '/manager-apartments', 
      icon: Building2, 
      isConstant: false 
    },
    financial_management: { 
      id: 'financial_management', 
      name: 'Finance', 
      icon: BanknoteArrowDown, 
      isConstant: false, 
      children: [{ name: 'Bills', path: '/manager-bills' }, { name: 'Collections', path: '/collections' }] 
    },
    maintenance_management: { 
      id: 'maintenance_management', 
      name: 'Maintenance', 
      path: '/maintenance-requests', 
      icon: Wrench, 
      isConstant: false 
    },
    maintenance_tasks: { 
      id: 'maintenance_tasks', 
      name: 'Maintenance Tasks', 
      path: '/maintenance-tasks', 
      icon: Wrench, 
      isConstant: false 
    },
    work_orders: { 
      id: 'work_orders', 
      name: 'Work Orders', 
      path: '/work-orders', 
      icon: ClipboardList, 
      isConstant: false 
    },
    inventory_management: { 
      id: 'inventory_management', 
      name: 'Inventory', 
      path: '/inventory', 
      icon: FileText, 
      isConstant: false 
    },
    my_apartments: { 
      id: 'my_apartments', 
      name: 'My Apartments', 
      path: '/owner-apartments', 
      icon: Building2, 
      isConstant: false 
    },
    my_expenses: { 
      id: 'my_expenses', 
      name: 'My Expenses', 
      icon: BanknoteArrowDown, 
      isConstant: false, 
      children: [{ name: 'My Bills', path: '/owner-bills' }, { name: 'Payment History', path: '/payment-history' }] 
    },
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
  }, [userRole, userId, lastRefresh]); // Added lastRefresh dependency

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

  const formatRoleName = (role) => role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 h-full z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center justify-between w-full">
            <span className="text-xl font-bold text-gray-800 dark:text-gray-300">
              {userRole === 'Admin' ? 'AptSync Admin' : 'AptSync Employee'}
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
      <nav className="p-4 space-y-1">
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

      {/* Role badge */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-300">Logged in as</p>
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
              {formatRoleName(userRole)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}