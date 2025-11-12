// components/RoleAssignmentModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Check, Square, CheckSquare, Save, Shield, User, Building, Wrench, Package, BarChart3, CreditCard, FileText, Home } from 'lucide-react';
import api from '../api/axios';

const RoleAssignmentModal = ({ role, onClose, onAssign }) => {
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Define ALL possible sidebar components for non-admin roles
  const allComponents = [
    // Core Components (Always included for non-admin roles)
    { 
      id: 'employee_dashboard', 
      name: 'Employee Dashboard', 
      description: 'Main dashboard for employees',
      category: 'Core',
      icon: 'Home'
    },
    { 
      id: 'profile', 
      name: 'Profile', 
      description: 'User profile management',
      category: 'Core', 
      icon: 'User'
    },

    // Management Components
    { 
      id: 'users_management', 
      name: 'User Management', 
      description: 'Manage system users',
      category: 'Management',
      icon: 'Users'
    },
    { 
      id: 'role_management', 
      name: 'Role Management', 
      description: 'Manage user roles and permissions',
      category: 'Management',
      icon: 'Shield'
    },
    { 
      id: 'apartments_management', 
      name: 'Apartments Management', 
      description: 'Manage apartment buildings',
      category: 'Management',
      icon: 'Building'
    },
    { 
      id: 'tenant_management', 
      name: 'Tenant Management', 
      description: 'Manage tenants and residents',
      category: 'Management',
      icon: 'Users'
    },
    { 
      id: 'property_management', 
      name: 'Property Management', 
      description: 'Manage properties and units',
      category: 'Management',
      icon: 'Building'
    },

    // Financial Components
    { 
      id: 'expenses_management', 
      name: 'Expenses Management', 
      description: 'Manage bills and expenses',
      category: 'Financial',
      icon: 'DollarSign'
    },
    { 
      id: 'financial_management', 
      name: 'Financial Management', 
      description: 'Comprehensive financial tools',
      category: 'Financial',
      icon: 'CreditCard'
    },
    { 
      id: 'my_expenses', 
      name: 'Personal Expenses', 
      description: 'View personal bills and payments',
      category: 'Financial',
      icon: 'FileText'
    },

    // Maintenance Components
    { 
      id: 'maintenance_management', 
      name: 'Maintenance Management', 
      description: 'Manage maintenance requests',
      category: 'Maintenance',
      icon: 'Wrench'
    },
    { 
      id: 'maintenance_tasks', 
      name: 'Maintenance Tasks', 
      description: 'View and manage maintenance tasks',
      category: 'Maintenance',
      icon: 'Tool'
    },
    { 
      id: 'work_orders', 
      name: 'Work Orders', 
      description: 'Create and track work orders',
      category: 'Maintenance',
      icon: 'ClipboardList'
    },

    // Reports & Analytics
    { 
      id: 'reports_analytics', 
      name: 'Reports & Analytics', 
      description: 'View reports and analytics',
      category: 'Analytics',
      icon: 'BarChart3'
    },

    // Inventory
    { 
      id: 'inventory_management', 
      name: 'Inventory Management', 
      description: 'Manage inventory and supplies',
      category: 'Inventory',
      icon: 'Package'
    },

    // Personal
    { 
      id: 'my_apartments', 
      name: 'My Apartments', 
      description: 'View personal apartments',
      category: 'Personal',
      icon: 'Home'
    }
  ];

  // Group components by category
  const groupedComponents = allComponents.reduce((acc, component) => {
    const category = component.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {});

  useEffect(() => {
    if (role) {
      loadRoleComponents();
    }
  }, [role]);

  const loadRoleComponents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/role-components/role/${role.id}`);
      if (response.data.success) {
        const assignedComponents = response.data.data || [];
        setSelectedComponents(assignedComponents);
      }
    } catch (error) {
      console.error('Error loading role components:', error);
      setSelectedComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleComponent = (componentId) => {
    setSelectedComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  const selectAllInCategory = (category) => {
    const categoryComponents = groupedComponents[category].map(comp => comp.id);
    setSelectedComponents(prev => {
      const newSelection = [...prev];
      categoryComponents.forEach(compId => {
        if (!newSelection.includes(compId)) {
          newSelection.push(compId);
        }
      });
      return newSelection;
    });
  };

  const deselectAllInCategory = (category) => {
    const categoryComponents = groupedComponents[category].map(comp => comp.id);
    setSelectedComponents(prev => prev.filter(id => !categoryComponents.includes(id)));
  };

// In RoleAssignmentModal.jsx - update the handleSave function
const handleSave = async () => {
  try {
    setSaving(true);
    
    // Filter out constant components before saving
    const constantComponents = ['employee_dashboard', 'profile'];
    const customComponents = selectedComponents.filter(
      comp => !constantComponents.includes(comp)
    );
    
    const response = await api.post(`/role-components/role/${role.id}`, {
      components: customComponents
    });
    
    if (response.data.success) {
      // Show success message
      alert('Components assigned successfully! The sidebar will refresh for affected users.');
      
      // Call the onAssign callback
      onAssign(role.id, selectedComponents);
      
      // Close the modal
      onClose();
      
      // You could also trigger a global event here to refresh all sidebars
      // window.dispatchEvent(new Event('sidebarRefreshNeeded'));
    }
  } catch (error) {
    console.error('Error saving role components:', error);
    alert('Failed to save component assignments. Please try again.');
  } finally {
    setSaving(false);
  }
};

  const getCategoryIcon = (category) => {
    const icons = {
      'Core': User,
      'Management': Shield,
      'Financial': CreditCard,
      'Maintenance': Wrench,
      'Analytics': BarChart3,
      'Inventory': Package,
      'Personal': Home
    };
    const IconComponent = icons[category] || Square;
    return <IconComponent size={16} />;
  };

  if (!role) return null;

  // Don't show assignment modal for Admin role
  if (role.role_name === 'Admin') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="text-center">
            <Shield size={48} className="mx-auto text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Admin Role
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The Admin role has predefined sidebar components and cannot be modified.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Assign Sidebar Components to Role
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Role: <span className="font-medium text-purple-600 dark:text-purple-400">{role.role_name}</span>
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                (Dashboard and Profile are always included)
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Components List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Loading components...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedComponents).map(([category, components]) => (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  {/* Category Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {category} Components
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({components.length})
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => selectAllInCategory(category)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => deselectAllInCategory(category)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  
                  {/* Components Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                    {components.map(component => (
                      <div
                        key={component.id}
                        onClick={() => toggleComponent(component.id)}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedComponents.includes(component.id)
                            ? 'bg-purple-50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700 shadow-sm'
                            : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-center w-5 h-5 mr-3 mt-0.5">
                          {selectedComponents.includes(component.id) ? (
                            <CheckSquare size={18} className="text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Square size={18} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-white text-sm">
                            {component.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {component.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {selectedComponents.length} custom components selected + 2 constant components (Dashboard, Profile)
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Assignments
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;