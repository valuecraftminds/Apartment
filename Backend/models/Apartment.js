const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Apartment {
    static async create(apartmentData) {
        const { name, address, city, picture, company_id } = apartmentData;
        const apartment_id = `APT${Date.now()}`;
        
        // Get count of existing apartments for this company
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as count FROM apartments WHERE company_id = ?',
            [company_id]
        );
        
        // const nextNumber = (countResult[0].count + 1).toString().padStart(3, '0');
        const uuid = uuidv4();
       const nextNumber = (countResult[0].count + 1).toString().padStart(4, '0');
        const id = `${company_id}-${nextNumber}`;

        const [result] = await pool.execute(
            'INSERT INTO apartments (id, apartment_id, name, address, city, picture, is_active, company_id) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
            [id, apartment_id, name, address, city, picture, company_id]
        );
        return { id, apartment_id, ...apartmentData };
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM apartments WHERE id= ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            // 'SELECT * FROM apartments WHERE company_id=? ORDER BY CAST(SUBSTRING(company_id, 2) AS UNSIGNED) ASC',
            `SELECT 
            a.*, 
            COUNT(DISTINCT f.id) AS floors,
            COUNT(DISTINCT h.id) AS houses
        FROM apartments a 
        LEFT JOIN floors f ON a.id = f.apartment_id
        LEFT JOIN houses h ON f.id = h.floor_id
        WHERE a.company_id = ?
        GROUP BY a.id
        ORDER BY CAST(SUBSTRING(a.company_id, 2) AS UNSIGNED) ASC
    `,
            [company_id]
            
        );
        return rows;
    }

    static async findAll() {
        const [rows] = await pool.execute(
            `SELECT 
            a.*, 
            COUNT(DISTINCT f.id) AS floors,
            COUNT(DISTINCT h.id) AS houses
        FROM apartments a WHERE company_id=?
        LEFT JOIN floors f ON a.id = f.apartment_id
        LEFT JOIN houses h ON f.id = h.floor_id
        GROUP BY a.id
        ORDER BY a.CAST(SUBSTRING(company_id, 2) AS UNSIGNED) ASC
    `
        );
        return rows; 
    }

    // Deactivate apartment (set status to 'inactive')
    static async deactivate(id) {
    await pool.execute(
        'UPDATE apartments SET is_active = 0 WHERE id = ?',
        [id]
    );
    return true;
}
    //Activate Apartment
    static async activate(id) {
        await pool.execute(
            'UPDATE apartments SET is_active = 1 WHERE id = ?',
            [id]
        );
        return true;
    }

    static async update(id, apartmentData) {
        const { name, address, city, floors, houses, picture} = apartmentData;
        await pool.execute(
            'UPDATE apartments SET name = ?, address = ?, city = ?, floors = ?, houses = ?, picture = ? WHERE id = ?',
            [name, address, city, floors, houses, picture,id]
        );
        return {id, ...apartmentData };
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM apartments WHERE id = ?',
            [id]
        );
        return true;
    }
}

module.exports = Apartment;