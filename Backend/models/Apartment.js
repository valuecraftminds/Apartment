const pool = require('../db');
//const { v4: uuidv4 } = require('uuid');

class Apartment {
    static async create(apartmentData) {
        const { apartment_id,name, address, city, picture,company_id } = apartmentData;
        //const id = uuidv4();

        const [result] = await pool.execute(
            'INSERT INTO apartments (apartment_id, name, address, city,  picture, is_active, company_id) VALUES (?, ?, ?, ?, ?, 1, ?)',
            [apartment_id, name, address, city, picture, company_id]

        );
        return { apartment_id, ...apartmentData };
    }

    static async findById(apartment_id) {
        const [rows] = await pool.execute(
            'SELECT * FROM apartments WHERE apartment_id= ?',
            [apartment_id]
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
    static async deactivate(apartment_id) {
    await pool.execute(
        'UPDATE apartments SET is_active = 0 WHERE apartment_id = ?',
        [apartment_id]
    );
    return true;
}
    //Activate Apartment
    static async activate(apartment_id) {
        await pool.execute(
            'UPDATE apartments SET is_active = 1 WHERE apartment_id = ?',
            [apartment_id]
        );
        return true;
    }

    static async update(apartment_id, apartmentData) {
        const { name, address, city, floors, houses, picture} = apartmentData;
        await pool.execute(
            'UPDATE apartments SET name = ?, address = ?, city = ?, floors = ?, houses = ?, picture = ? WHERE apartment_id = ?',
            [name, address, city, floors, houses, picture, apartment_id]
        );
        return { apartment_id, ...apartmentData };
    }

    static async delete(apartment_id) {
        await pool.execute(
            'DELETE FROM apartments WHERE apartment_id = ?',
            [apartment_id]
        );
        return true;
    }
}

module.exports = Apartment;