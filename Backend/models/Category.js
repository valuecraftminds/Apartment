const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Category {
    // Get all categories
    static async findAll() {
        const [rows] = await pool.execute(
            `SELECT * FROM complaint_categories 
             WHERE is_active = TRUE 
             ORDER BY name ASC`
        );
        return rows;
    }

    // Get category by ID
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT * FROM complaint_categories WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    // Get category by name
    static async findByName(name) {
        const [rows] = await pool.execute(
            `SELECT * FROM complaint_categories WHERE name = ?`,
            [name]
        );
        return rows[0];
    }

    // Create new category
    static async create(categoryData) {
        const { name, description, icon = 'wrench', color = 'gray' } = categoryData;
        const id = uuidv4();
        
        const [result] = await pool.execute(
            `INSERT INTO complaint_categories (id, name, description, icon, color) 
             VALUES (?, ?, ?, ?, ?)`,
            [id, name, description, icon, color]
        );
        
        return { id, ...categoryData };
    }

    // Update category
    static async update(id, updateData) {
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
        params.push(id);
        
        await pool.execute(
            `UPDATE complaint_categories SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
        
        return this.findById(id);
    }

    // Delete category (soft delete)
    static async delete(id) {
        await pool.execute(
            `UPDATE complaint_categories SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [id]
        );
        return true;
    }
}

module.exports = Category;