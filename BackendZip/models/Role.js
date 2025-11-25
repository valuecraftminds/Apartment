//models/Role.js
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Roles{
    static async create(roleData){
        const {company_id, role_name} = roleData;
        const id = uuidv4().replace(/-/g, '').substring(0, 10);

        const[result] = await pool.execute(
            'INSERT INTO roles(id, company_id, role_name,is_active) values (?, ?, ?, 1) ',
            [id, company_id, role_name]
        );
        return { id, ...roleData };
    }

    // Check for similar role names (case-insensitive, ignoring spaces and special characters)
    static async findSimilarRoleName(company_id, role_name) {
        // Normalize the input: lowercase, remove extra spaces, remove common words
        const normalizedInput = role_name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            // .replace(/\b(bill|charge|fee|payment|amount)\b/gi, '') // Remove common words
            .trim();
        
        const [rows] = await pool.execute(
            `SELECT * FROM roles 
             WHERE company_id = ? 
             AND (
                 LOWER(TRIM(role_name)) = LOWER(TRIM(?)) OR
                 LOWER(REPLACE(role_name, ' ', '')) = LOWER(REPLACE(?, ' ', '')) OR
                 SOUNDEX(role_name) = SOUNDEX(?)
             )`,
            [company_id, role_name, role_name, role_name]
        );
        return rows.length > 0;
    }

   
    static async findByRoleName(role_name, company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM roles WHERE role_name = ? AND company_id = ?', // Fixed AND operator
            [role_name, company_id]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM roles WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM roles WHERE company_id=? ORDER BY created_at ASC',
            [company_id]
        );
        return rows;
    }

    static async findByApartment(apartment_id) {
    const [rows] = await pool.execute(
        'SELECT * FROM roles WHERE apartment_id=? ORDER BY created_at ASC',
        [apartment_id]
    );
    return rows;
}

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM roles ORDER BY created_at DESC'
        );
        return rows; 
    }

    static async update(id, roleData) {
        const {role_name} = roleData;
        await pool.execute(
            'UPDATE roles SET role_name=? WHERE id = ?',
            [ role_name,id]
        );
        return { id, ...roleData };
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM roles WHERE id = ?',
            [id]
        );
        return true;
    }    
}
module.exports=Roles;