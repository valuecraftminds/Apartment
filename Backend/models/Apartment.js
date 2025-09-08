const pool = require('../db');
//const { v4: uuidv4 } = require('uuid');

class Apartment {
    static async create(apartmentData) {
        const { id,name, address, city, floors, houses, picture, status,company_id } = apartmentData;
        //const id = uuidv4();

        const [result] = await pool.execute(
            'INSERT INTO apartments (id, name, address, city, floors, houses,picture , status,company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, address, city, floors, houses, picture, status,company_id]
        );
        return { id, ...apartmentData };
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM apartments WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM apartments WHERE company_id=? ORDER BY created_at DESC',
            [company_id]
        );
        return rows;
    }

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM apartments ORDER BY created_at DESC'
        );
        return rows; 
    }

    // Deactivate apartment (set status to 'inactive')
    static async deactivate(id) {
        await pool.execute(
            'UPDATE apartments SET status = "inactive" WHERE id = ?',
            [id]
        );
        return true;
    }

    // Activate apartment (set status to 'active')
    static async activate(id) {
        await pool.execute(
            'UPDATE apartments SET status = "active" WHERE id = ?',
            [id]
        );
        return true;
    }

    static async update(id, apartmentData) {
        const { name, address, city, floors, houses, picture, status } = apartmentData;
        await pool.execute(
            'UPDATE apartments SET name = ?, address = ?, city = ?, floors = ?, houses = ?, picture = ?, status = ? WHERE id = ?',
            [name, address, city, floors, houses, picture, status, id]
        );
        return { id, ...apartmentData };
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