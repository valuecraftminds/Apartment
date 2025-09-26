const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Floor {
    static async create(floorData) {
        const { company_id, apartment_id, floor_id, house_count  } = floorData;
        const id = uuidv4().replace(/-/g, '').substring(0, 10);

        const [result] = await pool.execute(
            'INSERT INTO floors (id, company_id, apartment_id, floor_id,  house_count) VALUES (?, ?, ?, ?, ?)',
            [id,company_id, apartment_id, floor_id, null]
        );
        return { id, ...floorData };
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM floors WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM floors WHERE company_id=? ORDER BY created_at DESC',
            [company_id]
        );
        return rows;
    }

    static async findByApartmentId(apartment_id){
        const [rows] = await pool.execute(
            'SELECT * FROM floors WHERE apartment_id=? ORDER BY CAST(SUBSTRING(floor_id, 2) AS UNSIGNED) ASC',
        [apartment_id]
        );
        return rows;
    }

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM floors ORDER BY created_at DESC'
        );
        return rows; 
    }

    //UPdate Floors
    static async update(id, floorData) {
        const { house_count } = floorData;
        await pool.execute(
            'UPDATE floors SET house_count = ? WHERE id = ?',
            [house_count,id]
        );
        return { id, ...floorData };
    }

    // Deactivate floor (set status to 'inactive')
    static async deactivate(id) {
    await pool.execute(
        'UPDATE floors SET is_active = 0 WHERE id = ?',
        [id]
    );
    return true;
    
}
    //Activate floor
    static async activate(id) {
        await pool.execute(
            'UPDATE floors SET is_active = 1 WHERE id = ?',
            [id]
        );
        return true;
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM floors WHERE id = ?',
            [id]
        );
        return true;
    }
}

module.exports = Floor;