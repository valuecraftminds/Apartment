// models/RoleComponent.js
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class RoleComponent {
    static async create(componentData) {
        const { role_id, component_id, company_id } = componentData;
        const id = uuidv4().replace(/-/g, '').substring(0, 10);

        const [result] = await pool.execute(
            'INSERT INTO role_components (id, role_id, component_id, company_id) VALUES (?, ?, ?, ?)',
            [id, role_id, component_id, company_id]
        );
        return { id, ...componentData };
    }

    static async findByRoleId(role_id) {
        const [rows] = await pool.execute(
            'SELECT component_id FROM role_components WHERE role_id = ? ORDER BY created_at ASC',
            [role_id]
        );
        return rows.map(row => row.component_id);
    }

    static async findByRoleAndCompany(role_id, company_id) {
        const [rows] = await pool.execute(
            'SELECT component_id FROM role_components WHERE role_id = ? AND company_id = ? ORDER BY created_at ASC',
            [role_id, company_id]
        );
        return rows.map(row => row.component_id);
    }

    static async deleteByRoleId(role_id) {
        await pool.execute(
            'DELETE FROM role_components WHERE role_id = ?',
            [role_id]
        );
        return true;
    }

    static async bulkCreate(components) {
        if (components.length === 0) return [];
        
        const values = components.map(comp => [comp.id, comp.role_id, comp.component_id, comp.company_id]);
        const placeholders = components.map(() => '(?, ?, ?, ?)').join(', ');
        
        const query = `INSERT INTO role_components (id, role_id, component_id, company_id) VALUES ${placeholders}`;
        
        await pool.execute(query, values.flat());
        return components;
    }
}

module.exports = RoleComponent;