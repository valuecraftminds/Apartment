// controllers/roleComponentController.js
const RoleComponent = require('../models/RoleComponent');
const { v4: uuidv4 } = require('uuid');

const roleComponentController = {
    async assignComponents(req, res) {
        try {
            const { role_id } = req.params;
            const { components } = req.body;
            const company_id = req.user.company_id;

            if (!components || !Array.isArray(components)) {
                return res.status(400).json({
                    success: false,
                    message: 'Components array is required'
                });
            }

            // Delete existing components for this role
            await RoleComponent.deleteByRoleId(role_id);

            // Create new component assignments
            const componentData = components.map(component_id => ({
                id: uuidv4().replace(/-/g, '').substring(0, 10),
                role_id,
                component_id,
                company_id
            }));

            await RoleComponent.bulkCreate(componentData);

            res.json({
                success: true,
                message: 'Components assigned successfully',
                data: components
            });
        } catch (err) {
            console.error('Assign components error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while assigning components'
            });
        }
    },

    async getRoleComponents(req, res) {
        try {
            const { role_id } = req.params;
            const company_id = req.user.company_id;

            const components = await RoleComponent.findByRoleAndCompany(role_id, company_id);

            res.json({
                success: true,
                data: components
            });
        } catch (err) {
            console.error('Get role components error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching role components'
            });
        }
    },

    // controllers/roleComponentController.js - Update getUserComponents
async getUserComponents(req, res) {
    try {
        const userRole = req.user.role;
        const company_id = req.user.company_id;

        console.log('Fetching components for user role:', userRole, 'company:', company_id);

        // For Admin role, return empty array (Admin uses predefined components)
        if (userRole === 'Admin') {
            return res.json({
                success: true,
                data: [] // Empty array tells frontend to use admin's predefined components
            });
        }

        // For other roles, get assigned components
        const pool = require('../db');
        
        // First, get the role_id from the user's role name
        const [roleRows] = await pool.execute(
            'SELECT id FROM roles WHERE role_name = ? AND company_id = ? AND is_active = 1',
            [userRole, company_id]
        );

        console.log('Found role:', roleRows);

        if (roleRows.length === 0) {
            // If role not found, return only constant components
            return res.json({
                success: true,
                data: ['employee_dashboard', 'profile']
            });
        }

        const role_id = roleRows[0].id;
        
        // Get assigned components for this role
        const [componentRows] = await pool.execute(
            'SELECT component_id FROM role_components WHERE role_id = ? AND company_id = ? ORDER BY created_at ASC',
            [role_id, company_id]
        );

        const assignedComponents = componentRows.map(row => row.component_id);
        
        console.log('Assigned components from DB:', assignedComponents);

        // Always include constant components for non-admin roles
        const constantComponents = ['employee_dashboard', 'profile'];
        
        // Combine and remove duplicates
        const allComponents = [...new Set([...constantComponents, ...assignedComponents])];
        
        console.log('Final components to return:', allComponents);

        res.json({
            success: true,
            data: allComponents
        });
    } catch (err) {
        console.error('Get user components error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user components'
        });
    }
}
};

module.exports = roleComponentController;