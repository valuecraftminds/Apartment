const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Category {
    // Get all categories for a company
    static async findAll(companyId) {
        const [rows] = await pool.execute(
            `SELECT * FROM complaint_categories 
             WHERE is_active = TRUE AND company_id = ?
             ORDER BY name ASC`,
            [companyId]
        );
        return rows;
    }

    // Get category by ID with company check
    static async findById(id, companyId) {
        const [rows] = await pool.execute(
            `SELECT * FROM complaint_categories WHERE id = ? AND company_id = ?`,
            [id, companyId]
        );
        return rows[0];
    }

    // Get category by name with company check
    static async findByName(name, companyId) {
        const [rows] = await pool.execute(
            `SELECT * FROM complaint_categories WHERE name = ? AND company_id = ?`,
            [name, companyId]
        );
        return rows[0];
    }

    // Create new category with company_id
    static async create(categoryData) {
        const { name, description, company_id, icon = 'wrench', color = 'gray' } = categoryData;
        const id = uuidv4();
        
        const [result] = await pool.execute(
            `INSERT INTO complaint_categories (id, name, description, company_id, icon, color) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, name, description, company_id, icon, color]
        );
        
        return { id, ...categoryData };
    }

    // Update category with company check
    static async update(id, companyId, updateData) {
        const { name, description, icon, color, is_active } = updateData;
        
        const updates = [];
        const params = [];
        
        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        
        if (icon !== undefined) {
            updates.push('icon = ?');
            params.push(icon);
        }
        
        if (color !== undefined) {
            updates.push('color = ?');
            params.push(color);
        }
        
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active);
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id, companyId);
        
        await pool.execute(
            `UPDATE complaint_categories SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`,
            params
        );
        
        return this.findById(id, companyId);
    }

    // Delete category (soft delete) with company check
    static async delete(id, companyId) {
        await pool.execute(
            `UPDATE complaint_categories SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ? AND company_id = ?`,
            [id, companyId]
        );
        return true;
    }
}

module.exports = Category;